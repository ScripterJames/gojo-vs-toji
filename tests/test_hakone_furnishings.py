"""All-room reachability, real E input, interaction fixes and grounded sprite tests.

Real Chromium, candidate scripts in page.set_content, explicit storage fixture.
This is not a live-origin or native-storage test; the separate origin suite does
that at localhost. Positions are seeded to BFS-verified accessible cells. No
claim is made that a human walked every route or balance-tested every fighter.
"""
from pathlib import Path
import json, re, os, shutil, tempfile
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
A=ROOT/'adventure'
OUT=Path(tempfile.mkdtemp(prefix='hakone-furnishings-'))
source=(A/'index.html').read_text()
source=re.sub(r'<script src="([^"]+)"[^>]*></script>',lambda m:'<script>'+(A/m.group(1).split('?')[0]).read_text()+'</script>',source)
checks=[]
def check(name,ok,detail=None):
    assert ok,(name,detail)
    checks.append(name)

BFS=r'''()=>{
 const report=[];
 for(const room of [null,...Object.keys(HakoneData.shops)]){
  if(room)HakoneLife.enter(room);else if(HakoneLife.snapshot().room)HakoneLife.interact(HakoneLife.objects().find(o=>o.id==='exit'));
  const objects=HakoneLife.objects(),blocked=HakoneLife.blocked;
  const seed=room?[320,408]:[200,272],q=[seed],visited=new Set([seed.join(',')]);
  for(let i=0;i<q.length;i++){
   const [x,y]=q[i];for(const [dx,dy] of [[8,0],[-8,0],[0,8],[0,-8]]){
    const nx=x+dx,ny=y+dy,k=nx+','+ny;
    if(!visited.has(k)&&!blocked(nx,ny)){visited.add(k);q.push([nx,ny]);}
   }
  }
  const targets=objects.map(o=>{
   let best=null;
   for(const [x,y] of q){if(x<o.x-48||x>o.x+o.w+48||y<o.y-48||y>o.y+o.h+48)continue;
    const dir=Math.abs(o.x+o.w/2-x)>Math.abs(o.y+o.h/2-y)?(x<o.x+o.w/2?'right':'left'):(y<o.y+o.h/2?'down':'up');
    const player={x,y,dir};
    if(HakoneInteractions.canReach(player,o,objects)){
     const choices=HakoneInteractions.nearby(player,objects),cost=Math.hypot(x-seed[0],y-seed[1])+(choices[0].object.id===o.id?0:10000);
     if(!best||cost<best.cost)best={x,y,dir,cost};
    }
   }
   return {id:o.id,type:o.type,stand:best};
  });report.push({room,objects:objects.length,cells:q.length,targets});
 }return report;
}'''
with sync_playwright() as p:
    executable=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium') or shutil.which('chromium-browser')
    browser=p.chromium.launch(executable_path=executable,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    errors=[]
    def load(state=None,manual=True):
        page=browser.new_page(viewport={'width':1100,'height':1000})
        page.on('pageerror',lambda e:errors.append(str(e)))
        db={'hakone-life-town-v1':json.dumps(state or {}),'gojo-vs-toji-arcade-coins-v1':'500','gojo-vs-toji-upgrade-starter-v1':'yes'}
        inject='<script>window.__store='+json.dumps(db)+''';Object.defineProperty(window,'localStorage',{value:{getItem:k=>__store[k]??null,setItem:(k,v)=>__store[k]=String(v)}});'''+('window.requestAnimationFrame=()=>0;' if manual else '')+'</script>'
        page.set_content(source.replace('<script>',inject+'<script>',1))
        return page
    page=load()
    report=page.evaluate(BFS)
    (OUT/'reachability.json').write_text(json.dumps(report,indent=2))
    for room in report:
        missing=[t['id'] for t in room['targets'] if not t['stand']]
        check(f"Every object approachable in {room['room'] or 'town'}",not missing,missing)
    check('Three long 7-Eleven aisles',page.evaluate("HakoneInteriors.get('seven').filter(o=>o.aisle&&o.h>=120).length") == 3)
    check('Ramen tables and benches',page.evaluate("HakoneInteriors.get('ramen').filter(o=>o.type==='table').length>=2 && HakoneInteriors.get('ramen').filter(o=>o.type==='seat').length>=6"))
    page.close()
    total=0
    # Actual keyboard activation for every outdoor and indoor object.
    for room in report:
        for t in room['targets']:
            st=t['stand'];page=load({'room':room['room'],'x':st['x'],'y':st['y'],'dir':st['dir']})
            page.locator('#world').focus()
            choices=page.evaluate('HakoneLife.nearby()')
            check(f"Reach list contains {room['room'] or 'town'}/{t['id']}",t['id'] in choices)
            for _ in range(len(choices)):
                selected=page.evaluate("HakoneInteractions.select(HakoneLife.snapshot(),HakoneLife.objects())?.object.id")
                # Prefer explicit cycling instead of touching private state.
                page.keyboard.press('e')
                got=page.evaluate('HakoneLife.snapshot().lastInteraction')
                if got==t['id']:break
                # At a shared target, close the prior panel then cycle once.
                if page.locator('#panel').evaluate('(x)=>x.open'):page.locator('#panelClose').click()
                if page.evaluate('HakoneLife.snapshot().room')!=room['room']:
                    raise AssertionError(('Unexpected door selected',room['room'],t['id'],got))
                page.keyboard.press('Tab')
            check(f"E activates {room['room'] or 'town'}/{t['id']}",got==t['id'],got)
            total+=1;page.close()
    check('All placed objects tested',total>=150,total)
    page=load({'room':'seven','x':320,'y':410})
    check('Far machine cannot be used',not page.evaluate("HakoneLife.tryInteract(HakoneLife.objects().find(o=>o.id==='coffee'))"))
    check('Range rejection keeps wallet',page.evaluate('HakoneLife.snapshot().coins')==500)
    check('Shelf blocks reaching through it',page.evaluate("""()=>{
      const wall={id:'wall',type:'shelf',x:30,y:20,w:8,h:60,solid:true};
      const target={id:'target',type:'coffee',x:42,y:30,w:12,h:20,solid:true};
      return !HakoneInteractions.canReach({x:20,y:44,dir:'right'},target,[wall,target]);
    }"""))
    check('Aisle browsable from both sides',page.evaluate("""()=>{
      const o=HakoneInteriors.get('seven').find(o=>o.id==='shelf0'),all=HakoneInteriors.get('seven');
      return HakoneInteractions.canReach({x:o.x-10,y:o.y+76,dir:'right'},o,all)&&HakoneInteractions.canReach({x:o.x+o.w+10,y:o.y+76,dir:'left'},o,all);
    }"""))
    page.close()
    # Real pointer and button controls use the same reachable target as E.
    target=next(t for r in report if r['room']=='seven' for t in r['targets'] if t['id']=='shelf0')
    st=target['stand'];page=load({'room':'seven','x':st['x'],'y':st['y'],'dir':st['dir']},manual=False)
    page.wait_for_function("document.getElementById('prompt').textContent.includes('E —')")
    click=page.evaluate("""()=>{
      const o=HakoneLife.objects().find(o=>o.id==='shelf0'),s=HakoneLife.snapshot(),r=document.getElementById('world').getBoundingClientRect();
      const cy=Math.round(Math.max(0,Math.min(80,s.y-220)));
      return {x:r.left+(o.x+o.w/2)*r.width/640,y:r.top+(o.y+o.h/2-cy)*r.height/400};
    }""")
    page.mouse.click(click['x'],click['y'])
    check('Pointer opens clicked reachable aisle',page.evaluate('HakoneLife.snapshot().lastInteraction')=='shelf0' and page.locator('#panel').evaluate('(p)=>p.open'))
    page.locator('#panelClose').click()
    check('Closing panel restores movement focus',page.locator('#world').evaluate('(c)=>document.activeElement===c'))
    spot=page.evaluate("""()=>{
      const all=HakoneLife.objects();
      for(let y=90;y<425;y+=8)for(let x=44;x<595;x+=8){
        const s={x,y,dir:'right'},n=HakoneInteractions.nearby(s,all);
        if(!HakoneLife.blocked(x,y)&&n.length>1&&n.every(t=>!['exit','building'].includes(t.object.type)))return s;
      }return null;
    }""")
    check('Nearby targets can be disambiguated',bool(spot));page.close()
    page=load({'room':'seven',**spot},manual=False)
    page.locator('#world').focus();choices=page.evaluate('HakoneLife.nearby()')
    page.keyboard.press('Tab');page.keyboard.press('e')
    check('Tab chooses the next nearby object',page.evaluate('HakoneLife.snapshot().lastInteraction')==choices[1])
    page.locator('#panelClose').click()
    page.locator('#nextTarget').click();page.locator('#interactButton').click()
    check('Next and Interact buttons select consistently',page.evaluate('HakoneLife.snapshot().lastInteraction')==choices[2%len(choices)])
    page.close()
    # Old saves inside new furniture are moved to nearby free space in that room.
    page=load({'room':'seven','x':145,'y':240,'bag':{'onigiri':2}})
    snap=page.evaluate('HakoneLife.snapshot()')
    check('Furniture save migration keeps room and bag',snap['room']=='seven' and snap['bag']['onigiri']==2)
    check('Furniture save migration chooses free space',not page.evaluate('(s)=>HakoneLife.blocked(s.x,s.y)',snap));page.close()
    st=next(r for r in report if r['room']=='ramen')['targets']
    st=next(t['stand'] for t in st if t['id']=='seat')
    page=load({'room':'ramen','x':st['x'],'y':st['y'],'dir':st['dir'],'energy':20},manual=False)
    page.evaluate("HakoneLife.interact(HakoneLife.objects().find(o=>o.id==='seat'))")
    page.get_by_role('button',name='Sit and rest · +25 energy',exact=True).click()
    check('Bench gives actual seated pose',page.evaluate('HakoneLife.snapshot().seated')=='seat')
    check('Bench restores energy',page.evaluate('HakoneLife.snapshot().energy')>44)
    page.keyboard.down('ArrowRight')
    try:page.wait_for_function('HakoneLife.snapshot().seated===null',timeout=10000)
    finally:page.keyboard.up('ArrowRight')
    check('Movement stands up',page.evaluate('HakoneLife.snapshot().seated') is None)
    page.close()
    # All original art frames are rasterized and their measured soles meet the floor.
    page=browser.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content('<canvas id="art" width="300" height="500"></canvas><script>'+(A/'arena_art.js').read_text()+'</script>')
    result=page.evaluate("""()=>{
      const names=['Hakari','Sukuna','Megumi','Yuji','Nobara','Maki','Toge','Panda','Nanami','Yuta','Choso','Todo','Jogo','Mahito'];
      const failures=[],clipSignatures={},c=document.getElementById('art').getContext('2d');let count=0,grounded=0;c.imageSmoothingEnabled=false;
      for(const name of names)for(const [key,clip] of Object.entries(HakoneArtFighters.clips))for(let i=0;i<clip.count;i++){
        const f=HakoneArtFighters.frame(name,key,i),d=f.image.getContext('2d').getImageData(0,0,112,90).data;
        let last=-1,edge=0,n=0;for(let y=0;y<90;y++)for(let x=0;x<112;x++)if(d[(y*112+x)*4+3]){last=y;n++;if(x===0||x===111||y===0||y===89)edge++;}
        if(n<100||last+1!==f.baseline||edge)failures.push([name,key,i,n,last,f.baseline,edge]);
        if(key!=='jump'){
          c.clearRect(0,0,300,500);c.drawImage(f.image,20,450-f.baseline*2,224,180);
          const row=c.getImageData(0,449,300,1).data,next=c.getImageData(0,450,300,1).data;
          if(!row.some((v,i)=>i%4===3&&v)||next.some((v,i)=>i%4===3&&v))failures.push([name,key,i,'feet not at baseline']);
          grounded++;
        }
        count++;
      }
      const actor={name:'Hakari',hp:100,y:345,h:105,vx:4};
      const phases=Array.from({length:64},(_,n)=>HakoneArtFighters.pose(actor,n).index);
      const idle={...actor,vx:0};
      return {count,grounded,failures,walkLoops:phases[0]===phases[32]&&new Set(phases.slice(32)).size===8,
       idleLoops:HakoneArtFighters.pose(idle,0).index===HakoneArtFighters.pose(idle,56).index,
       buffWalk:HakoneArtFighters.pose({...actor,jackpot:300},90).key==='walk'};
    }""")
    check('504 frames drawn without clipping',result['count']==504 and not result['failures'],result)
    check('All 490 grounded frames meet exact floor',result['grounded']==490 and not result['failures'],result)
    check('Walk cycles repeat instead of freezing',result['walkLoops'])
    check('Idle cycles repeat instead of freezing',result['idleLoops'])
    check('Long special buffs allow walking animation',result['buffWalk'])
    check('No JavaScript exceptions',not errors,errors)
    browser.close()
print(json.dumps({'passed':len(checks),'keyboard_objects':total,'report_directory':str(OUT),'scope':'Real Chromium, inlined source and explicit storage fixture, not public-origin playthrough','checks':checks},indent=2))
