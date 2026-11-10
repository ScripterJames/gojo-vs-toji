"""Furnished interiors, interaction routing and grounded sprite regression.
Default: real localhost HTTP origin and native localStorage in Chromium.
HAKONE_TEST_MODE=inline explicitly uses set_content and a Storage test double
for environments that block localhost. Browser keyboard/pointer/Canvas remain real.
Room entry is a deterministic fixture; interaction/walking uses production code.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json, os, re, shutil, tempfile
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(tempfile.mkdtemp(prefix='hakone-interaction-'))
INLINE=os.environ.get('HAKONE_TEST_MODE')=='inline'
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=None
if not INLINE:
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
checks=[]
def check(name,ok,detail=None):
    assert ok,(name,detail)
    checks.append({'test':name,'detail':detail})
    print('PASS '+name,flush=True)
try:
 with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1150,'height':1000})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    if INLINE:
        html=(ROOT/'adventure/index.html').read_text()
        for mod in ['data','art','shop_art','interiors','interaction','town']:
            html=re.sub(rf'<script src="{mod}\.js\?v=[^"]+"></script>',lambda _:'<script>'+(ROOT/f'adventure/{mod}.js').read_text()+'</script>',html)
        store='<script>const memory={};Object.defineProperty(window,"localStorage",{value:{getItem:k=>memory[k]??null,setItem:(k,v)=>memory[k]=String(v)}});</script>'
        page.set_content(html.replace('<script>',store+'<script>',1))
    else:
        page.goto(f'http://127.0.0.1:{server.server_port}/adventure/')
    page.wait_for_function('window.HakoneLife && window.HakoneInteriors && window.HakoneInteraction')
    snap=lambda:page.evaluate('HakoneLife.snapshot()')
    def close():
        if page.locator('#panel').evaluate('(d)=>d.open'):page.keyboard.press('Escape')
    def enter(room):
        close();page.evaluate('(r)=>HakoneLife.enter(r)',room)
        page.wait_for_timeout(60)
    def interact(id):
        close();page.evaluate('id=>HakoneLife.interact(HakoneLife.objects().find(o=>o.id===id))',id)
        page.wait_for_function('id=>document.getElementById("panel").open && document.getElementById("panel").dataset.target===id',arg=id,timeout=15000)
    def click_object(id):
        pos=page.evaluate('''id=>{const s=HakoneLife.snapshot(),o=HakoneLife.objects().find(o=>o.id===id),r=document.getElementById('world').getBoundingClientRect();
          const cx=Math.round(Math.max(0,Math.min((s.room?640:1280)-640,s.x-320))),cy=Math.round(Math.max(0,Math.min((s.room?480:800)-400,s.y-220)));
          return {x:r.x+(o.x+o.w/2-cx)*r.width/640,y:r.y+(o.y+o.h/2-cy)*r.height/400};}''',id)
        page.mouse.click(pos['x'],pos['y'])
    check('All interaction modules loaded',bool(page.evaluate('HakoneInteriors.roomIds.length===8')))
    # All object access paths checked against ACTUAL production collision geometry.
    rooms=[None]+page.evaluate('HakoneInteriors.roomIds')
    reach=[]
    for room in rooms:
        if room is not None:enter(room)
        report=page.evaluate('''()=>{
          const s=HakoneLife.snapshot(),objects=HakoneLife.objects(),bad=[];
          for(const o of objects){const path=HakoneInteraction.plan(s,o,HakoneLife.blocked,s.room?640:1280,s.room?480:800);
            if(path===null)bad.push(o.id);else{let prev=s;for(const p of path){if(!HakoneInteraction.line(prev,p,HakoneLife.blocked))bad.push(o.id+':blocked segment');prev=p;}}
          }
          return {count:objects.length,bad,idsUnique:new Set(objects.map(o=>o.id)).size===objects.length};
        }''')
        check('Reachable interaction paths: '+(room or 'town'),not report['bad'] and report['idsUnique'],report)
        reach.append(report['count'])
    enter('seven')
    check('7-Eleven has three proper aisles',page.evaluate("HakoneLife.objects().filter(o=>o.type==='aisle').length===3"))
    check('Aisles can be used from either side',page.evaluate('''()=>HakoneLife.objects().filter(o=>o.type==='aisle').every(o=>o.access.some(p=>p.x<o.x)&&o.access.some(p=>p.x>o.x+o.w))'''))
    enter('ramen')
    check('Ramen has tables, benches and counter seats',page.evaluate("HakoneLife.objects().filter(o=>o.type==='table').length>=2 && HakoneLife.objects().filter(o=>o.type==='bench').length>=2 && HakoneLife.objects().filter(o=>o.type==='stool').length>=3"))
    enter('seven')
    # Actual pointer click starts walking, rather than executing a distant purchase.
    before=snap();click_object('shelf1')
    check('Distant click walks rather than remotely opening a shop',page.evaluate("!!HakoneLife.route() && !document.getElementById('panel').open"))
    page.wait_for_function("document.getElementById('panel').open && document.getElementById('panel').dataset.target==='shelf1'",timeout=15000)
    check('Pointer approaches the intended aisle and opens its stock',page.locator('#panelTitle').inner_text().startswith('Aisle 2') and snap()['coins']==before['coins'])
    close();check('Escape restores canvas keyboard focus',page.evaluate("document.activeElement.id==='world'"))
    page.keyboard.press('e');check('E uses the same selected object as the prompt',page.locator('#panel').get_attribute('data-target')=='shelf1')
    close();interact('coffee');close()
    page.keyboard.down('ArrowUp')
    try:page.wait_for_function('HakoneLife.nearby().length>1',timeout=6000)
    finally:page.keyboard.up('ArrowUp')
    page.wait_for_timeout(70)
    original=page.locator('#prompt').inner_text()
    page.keyboard.press('q');page.wait_for_timeout(70)
    next_prompt=page.locator('#prompt').inner_text()
    check('Q cycles between nearby machines',original!=next_prompt,{'before':original,'after':next_prompt})
    page.keyboard.press('e');check('Cycled target opens its own interaction',page.locator('#panel').evaluate('(d)=>d.open'))
    close();enter('seven');click_object('freshFridge');page.keyboard.press('ArrowLeft')
    check('Manual movement cancels auto-walk',page.evaluate('HakoneLife.route()===null'))
    check('Unknown objects cannot trigger an interaction',page.evaluate("HakoneLife.interact({id:'not-a-real-object'})===false && !document.getElementById('panel').open"))
    # Empty-ground taps must actually move (the UI previously advertised this
    # but only object clicks worked), without opening menus or crossing furniture.
    enter('seven')
    ground=page.evaluate('''()=>{const s=HakoneLife.snapshot(),r=document.getElementById('world').getBoundingClientRect();const camY=Math.round(Math.max(0,480-400) && Math.max(0,Math.min(80,s.y-220)));return {x:r.x+405*r.width/640,y:r.y+(410-camY)*r.height/400}}''')
    check('Open-ground destination is walkable',not page.evaluate('HakoneLife.blocked(405,410)'))
    page.mouse.click(ground['x'],ground['y'])
    check('Ground click starts walking to requested spot',page.evaluate('''()=>{const r=HakoneLife.route();return !!r&&!!r.destination&&Math.abs(r.destination.x-405)<1&&Math.abs(r.destination.y-410)<1;}'''))
    page.wait_for_function('''()=>{const s=HakoneLife.snapshot();return Math.hypot(s.x-405,s.y-410)<2 && HakoneLife.route()===null;}''',timeout=6000)
    check('Ground walk arrives without remotely interacting',not page.locator('#panel').evaluate('(d)=>d.open'))
    # The touch path uses the same actual PointerEvent handler as a finger tap.
    page.evaluate('''()=>{const c=document.getElementById('world'),r=c.getBoundingClientRect();c.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',isPrimary:true,clientX:r.x+350*r.width/640,clientY:r.y+(410-Math.max(0,Math.min(80,HakoneLife.snapshot().y-220)))*r.height/400}));}''')
    page.wait_for_function('''()=>{const s=HakoneLife.snapshot();return Math.hypot(s.x-350,s.y-410)<2 && HakoneLife.route()===null;}''',timeout=6000)
    check('Touch pointer walks to empty floor',not page.locator('#panel').evaluate('(d)=>d.open'))
    # A blocked destination must neither teleport nor start a fake route.
    page.evaluate('''()=>{const c=document.getElementById('world'),r=c.getBoundingClientRect();c.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',isPrimary:true,clientX:r.x+259*r.width/640,clientY:r.y+(230-Math.max(0,Math.min(80,HakoneLife.snapshot().y-220)))*r.height/400}));}''')
    check('Blocked floor tap does not start a route',page.evaluate('HakoneLife.route()===null'))
    enter('seven');page.evaluate('''()=>{const c=document.getElementById('world'),r=c.getBoundingClientRect();c.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',isPrimary:true,clientX:r.x+400*r.width/640,clientY:r.y+(410-Math.max(0,Math.min(80,HakoneLife.snapshot().y-220)))*r.height/400}));}''')
    page.keyboard.press('ArrowLeft')
    check('Keyboard movement cancels floor walking',page.evaluate('HakoneLife.route()===null'))
    enter('seven');interact('freshFridge')
    row=page.locator('.item').filter(has=page.locator('strong',has_text='Salmon onigiri'))
    money=snap()['coins'];row.get_by_role('button',name='Buy',exact=True).click()
    check('Fridge stocks charge correctly and add to bag',snap()['coins']==money-11 and snap()['bag']['salmon']==1)
    close();enter('ramen');interact('seat');before=snap()['coins']
    page.get_by_role('button',name='Sit and rest').click()
    check('Dining bench restores energy for free',snap()['energy']==100 and snap()['coins']==before)
    interact('table');page.get_by_role('button',name='Eat or drink from your bag').click()
    check('Restaurant tables open usable inventory',page.locator('#panelTitle').inner_text()=='Your bag')
    close();enter('onsen');interact('lockerLeft')
    check('Changing cubbies open the bag',page.locator('#panelTitle').inner_text()=='Your bag')
    close();interact('wash0');before=snap()['coins'];page.get_by_role('button',name='Wash and freshen').click()
    check('Wash stations work without charging',snap()['coins']==before)
    enter('dojo');interact('gearRack');check('Gear rack offers useful actions',page.get_by_role('button',name='Fighter upgrades',exact=True).count()==1)
    close();enter('station');interact('ticketCounter');check('Station counter offers travel destinations',page.get_by_role('button',name='Travel to Shopping street').count()==1)
    # Pixel-level grounding: assert the actual drawn alpha bounds, not only constants.
    close();page.add_script_tag(content=(ROOT/'adventure/arena_art.js').read_text())
    pixels=page.evaluate('''()=>{
      const A=HakoneArtFighters,m=A.metrics(),bad=[],names=A.roster;let frames=0;
      for(const n of names)for(const key of ['idle','walk','punch','kick','special','hurt','defeated'])for(let i=0;i<A.clips[key].count;i++){
        const cv=A.frame(n,key,i),a=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let max=-1,count=0;
        for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(a[(y*cv.width+x)*4+3]){max=Math.max(max,y);count++;}
        if(max+1!==m.soleY||count<100)bad.push([n,key,i,max,count]);frames++;
      }
      const f={name:'Hakari',hp:100,x:0,y:345,h:105,w:54,vx:0,vy:0,attack:0,invul:0,flash:0};
      const idle=A.pose(f,0).index===A.pose(f,56).index&&A.pose(f,7).index!==A.pose(f,0).index;
      f.vx=4;const walk=A.pose(f,0).index===A.pose(f,30).index&&A.pose(f,5).index!==A.pose(f,0).index;
      f.attack=12;f.attackKind='punch';const first=A.pose(f,0);f.attack=4;const contact=A.pose(f,0);
      return {bad,frames,count:names.length,idle,walk,first,contact,cached:A.frame('Hakari','idle',0)===A.frame('Hakari','idle',0)};
    }''')
    check('Every grounded frame plants feet at its sole anchor',not pixels['bad'],pixels)
    check('Idle and walking loop instead of freezing',pixels['idle'] and pixels['walk'])
    check('Punch progresses from wind-up to contact',pixels['first']['index']==0 and pixels['contact']['index']==4)
    check('Sprite frames are cached',pixels['cached'])
    enter('seven');page.screenshot(path=str(OUT/'aisles.png'),full_page=True)
    enter('ramen');page.screenshot(path=str(OUT/'ramen.png'),full_page=True)
    page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(OUT/'mobile.png'),full_page=True)
    check('Mobile page still fits the screen',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    check('No JavaScript exceptions',not errors,errors)
    print(json.dumps({'passed':len(checks),'scope':'inline HTML, explicit Storage double' if INLINE else 'real localhost HTTP, native localStorage','objects_checked':sum(reach),'tests':checks,'screenshots':str(OUT)},indent=2))
    browser.close()
finally:
 if server:server.shutdown();server.server_close()
