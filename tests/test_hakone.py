"""Hakone Life regression checks.
Run from a repository checkout: python tests/test_hakone.py
Requires Python playwright and Chromium (CHROMIUM_EXECUTABLE may override path).
This suite loads candidate files into real Chromium via page.set_content,
uses an explicit source-injected position fixture for object handlers, and
uses an explicit Storage test double. It does NOT claim to test the remote
legacy arena or real-origin browser persistence. A separate blocked-storage
case exercises graceful degradation. Reports go to a temporary directory.
"""
from pathlib import Path
import json
import re
import os
import shutil
import tempfile
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
A=ROOT/'adventure'
OUT=Path(tempfile.mkdtemp(prefix='hakone-test-'))
base=(A/'index.html').read_text()
for name in ['data','art','shop_art','interiors','interaction','town']:
    source=(A/f'{name}.js').read_text()
    if name=='town':
        # Source-level fixture only: move to an approach point without spending
        # minutes walking every object. This hook is NOT shipped in town.js.
        source=source.replace('window.HakoneLife={',
            'window.__testPlace=(x,y)=>{state.x=x;state.y=y;route=null;chosen=null;hovered=null;};window.HakoneLife={')
    base=re.sub(rf'<script src="{name}\.js\?v=[^"]+"></script>',lambda _:'<script>'+source+'</script>',base)
COINS='gojo-vs-toji-arcade-coins-v1'
LEVELS='gojo-vs-toji-upgrade-levels-v1'
results=[]

def check(name,condition,detail=None):
    results.append({'test':name,'pass':bool(condition),'detail':detail})
    assert condition, (name,detail)

with sync_playwright() as p:
    executable=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium') or shutil.which('chromium-browser')
    browser=p.chromium.launch(executable_path=executable,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    def load(db=None,storage=True,width=1150,height=1050):
        page=browser.new_page(viewport={'width':width,'height':height})
        errs=[]
        page.on('pageerror',lambda x:errs.append(str(x)))
        html=base
        if storage:
            inject='<script>window.__testStore='+json.dumps(db or {})+';Object.defineProperty(window,"localStorage",{value:{getItem:k=>window.__testStore[k]??null,setItem:(k,v)=>{window.__testStore[k]=String(v)},removeItem:k=>delete window.__testStore[k]},configurable:true});</script>'
            html=html.replace('<script>',inject+'<script>',1)
        page.set_content(html)
        page.wait_for_timeout(80)
        return page,errs
    page,errors=load()
    snap=lambda: page.evaluate('HakoneLife.snapshot()')
    def interact(id):
        return page.evaluate('''id=>{
            const o=HakoneLife.objects().find(o=>o.id===id);
            const p=HakoneInteraction.access(o,HakoneLife.blocked)[0];
            if(!p)throw Error('No access point: '+id);
            window.__testPlace(p.x,p.y);return HakoneLife.interact(o);
        }''',id)
    def close():
        if page.locator('#panel').evaluate('(x)=>x.open'):
            page.locator('#panelClose').click()
    def buy(label):
        page.locator('.item').filter(has=page.locator('strong',has_text=label)).get_by_role('button',name='Buy',exact=True).click()
    check('Startup gift',snap()['coins']==50)
    x=snap()['x']
    page.locator('#world').focus()
    page.keyboard.down('ArrowRight')
    try:
        page.wait_for_function('(x) => HakoneLife.snapshot().x > x + 5',arg=x,timeout=10000)
    finally:
        page.keyboard.up('ArrowRight')
    check('Real keyboard movement',snap()['x']>x+5)
    interact('vending1');buy('Mineral water')
    check('Vending purchase',snap()['bag']['water']==1 and snap()['coins']==45)
    close();page.locator('#bagButton').click()
    page.locator('.item').filter(has=page.locator('strong',has_text='Mineral water')).get_by_role('button').click()
    check('Drink and empty container',snap()['bag']['water']==0 and snap()['trash']==1 and snap()['energy']>99)
    close();interact('bin1');page.get_by_role('button',name='Recycle all').click()
    check('Recycle once',snap()['coins']==46 and snap()['trash']==0)
    page.evaluate("HakoneLife.enter('seven')");interact('clerk')
    page.get_by_role('button',name='Pick up parcel for the ryokan').click()
    check('Parcel pickup',snap()['parcel'])
    page.evaluate("HakoneLife.enter('inn')");interact('host')
    page.get_by_role('button',name='Deliver the parcel').click()
    check('Parcel delivery reward',snap()['coins']==71 and not snap()['parcel'] and snap()['flags']['delivered'])
    interact('host')
    check('Duplicate delivery blocked',page.get_by_role('button',name='Deliver the parcel').is_disabled());close()
    page.evaluate("HakoneLife.enter('seven')");interact('shelf0');buy('Bento lunch box');close()
    interact('microwave');page.get_by_role('button',name='Prepare Bento lunch box').click()
    check('Bento microwave',snap()['bag']['bento']==0 and snap()['bag']['warmBento']==1)
    interact('shelf2');buy('Frozen smoothie cup');close();interact('blender')
    page.get_by_role('button',name='Prepare Frozen smoothie cup').click()
    check('Smoothie preparation',snap()['bag']['smoothieCup']==0 and snap()['bag']['smoothie']==1)
    interact('shelf2');buy('SEVEN CAFE cup');close();interact('coffee')
    page.get_by_role('button',name='Prepare SEVEN CAFE cup').click()
    check('Coffee preparation',snap()['bag']['cafeCup']==0 and snap()['bag']['cafe']==1)
    page.evaluate('window.__testStore["'+COINS+'"]="100"');page.locator('#upgradeButton').click()
    page.locator('.item').filter(has=page.locator('strong',has_text='Strength')).get_by_role('button').click()
    check('Upgrade spends correct price',snap()['coins']==65 and json.loads(page.evaluate('window.__testStore["'+LEVELS+'"]'))['Gojo']['power']==1);close()
    interact('atm');page.get_by_role('button',name='Store 25 coins').click()
    check('Coin deposit',snap()['coins']==40 and snap()['stash']==25)
    page.get_by_role('button',name='Take out 25 coins').click()
    check('Coin withdrawal',snap()['coins']==65 and snap()['stash']==0)
    check('Empty bank cannot withdraw',page.get_by_role('button',name='Take out 25 coins').is_disabled());close()
    before=snap()['coins']
    page.evaluate('Object.keys(HakoneData.shops).forEach(id=>HakoneLife.enter(id))')
    check('Six-building stamp reward',snap()['coins']==before+30 and len(snap()['stamps'])==8)
    page.evaluate('Object.keys(HakoneData.shops).forEach(id=>HakoneLife.enter(id))')
    check('Stamp reward not duplicated',snap()['coins']==before+30)
    page.evaluate("HakoneLife.enter('dojo')");interact('dummy')
    page.keyboard.press('f');page.keyboard.press('f');page.keyboard.press('d')
    check('Keyboard combo training',snap()['flags']['trained'] and snap()['coins']==before+38)
    page.locator('#fighterButton').click()
    page.get_by_role('button',name='Hakari · Jackpot',exact=True).click()
    check('New fighter selection persists in town',snap()['fighter']=='Hakari')
    for name,ability in [('Yuji','Black Flash'),('Nobara','Nail + Resonance'),('Maki','Weapon Sweep'),('Toge','Cursed Speech'),('Panda','Guard Stomp'),('Nanami','Ratio Strike'),('Yuta','Rika Guard'),('Choso','Piercing Blood'),('Todo','Boogie Woogie'),('Jogo','Volcanic Eruption'),('Mahito','Idle Transfiguration')]:
        page.locator('#fighterButton').click()
        page.get_by_role('button',name=name+' · '+ability,exact=True).click()
        check('Town selects '+name,snap()['fighter']==name)
    page.locator('#fighterButton').click()
    page.get_by_role('button',name='Toji · Heavenly Restriction',exact=True).click()
    check('Character selection',snap()['fighter']=='Toji')
    page.evaluate('HakoneLife.save()');db=page.evaluate('window.__testStore')
    restored,errs2=load(db);rs=restored.evaluate('HakoneLife.snapshot()')
    check('Save round trip through Storage contract',rs['coins']==snap()['coins'] and rs['fighter']=='Toji' and rs['bag']['warmBento']==1 and rs['flags']['delivered'])
    page.locator('#arenaTab').click()
    check('Separate arena mode switch',snap()['mode']=='arena' and page.locator('#leaveFight').is_visible())
    check('New Hakone Arena URL',page.locator('#arenaFrame').get_attribute('src').startswith('arena.html?from=hakone&p1=Toji'))
    page.locator('#leaveFight').click()
    check('Leave fight returns to town',snap()['mode']=='town' and page.locator('#arenaFrame').get_attribute('src')=='about:blank')
    for room in [None]+list(page.evaluate('Object.keys(HakoneData.shops)')):
        if room is None:
            page.evaluate("HakoneLife.enter('seven')");interact('exit')
        else:
            page.evaluate('(id)=>HakoneLife.enter(id)',room)
        for obj in page.evaluate('HakoneLife.objects()'):
            if obj['type'] in ['building','exit']:continue
            interact(obj['id']);close()
    check('All object handlers run from valid fixture approach points',not errors,errors)
    page.evaluate("HakoneLife.enter('seven')");interact('exit')
    unreachable=page.evaluate('''()=>{const q=[[200,272]],seen=new Set(['200,272']);for(let at=0;at<q.length;at++){const [x,y]=q[at];for(const [dx,dy] of [[8,0],[-8,0],[0,8],[0,-8]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(!seen.has(k)&&!HakoneLife.blocked(nx,ny)){seen.add(k);q.push([nx,ny]);}}}return HakoneLife.objects().filter(o=>!q.some(([x,y])=>x>o.x-64&&x<o.x+o.w+64&&y>o.y-64&&y<o.y+o.h+64&&HakoneInteraction.target(o,{x,y},HakoneLife.blocked))).map(o=>o.id)}''')
    check('Every outdoor object can be approached',not unreachable,unreachable)
    db['hakone-life-town-v1']=json.dumps({'x':152,'y':224,'fighter':'Gojo'})
    door,door_errors=load(db);door.keyboard.press('e')
    check('Keyboard E enters store',door.evaluate('HakoneLife.snapshot().room')=='seven')
    door.keyboard.press('e')
    check('Keyboard E exits store',door.evaluate('HakoneLife.snapshot().room') is None)
    fallback,fail_errors=load(storage=False);fs=fallback.evaluate('HakoneLife.snapshot()')
    check('Blocked storage degrades honestly',not fs['storageOK'] and fs['coins']==50 and 'temporary' in fallback.locator('#saveLabel').inner_text())
    mobile,mob_errors=load(db,width=390,height=844)
    check('Mobile layout does not overflow',mobile.evaluate('document.documentElement.scrollWidth<=window.innerWidth'))
    check('No JavaScript runtime errors',not errors+errs2+door_errors+fail_errors+mob_errors,errors+errs2+door_errors+fail_errors+mob_errors)
    page.screenshot(path=str(OUT/'town-tested.png'),full_page=True)
    mobile.screenshot(path=str(OUT/'town-mobile.png'),full_page=True)
    browser.close()
(OUT/'test-results.json').write_text(json.dumps({'environment':'Chromium; in-memory candidate HTML; explicit Storage test double; not live deployment','tests':results},indent=2))
print(json.dumps({'passed':len(results),'report_directory':str(OUT),'tests':[x['test'] for x in results]},indent=2))
