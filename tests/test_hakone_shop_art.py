"""Native-origin Chromium checks for the additive shop-art layer.
Uses actual repository files, HTTP, DOM and localStorage. Direct enter/interact
helpers make fixtures deterministic; this is not a public Pages playthrough.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
import shutil
import tempfile
import threading
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=Path(tempfile.mkdtemp(prefix='hakone-shop-art-'))
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
thread=threading.Thread(target=server.serve_forever,daemon=True)
thread.start()
results=[]
def check(name,condition,detail=None):
    results.append({'test':name,'pass':bool(condition),'detail':detail})
    assert condition,(name,detail)
try:
    with sync_playwright() as p:
        executable=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium') or shutil.which('chromium-browser')
        browser=p.chromium.launch(executable_path=executable,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        context=browser.new_context(viewport={'width':1100,'height':1000})
        page=context.new_page();errors=[];failed=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('requestfailed',lambda req:failed.append(req.url))
        page.goto(f'http://127.0.0.1:{server.server_port}/adventure/')
        page.wait_for_function('window.HakoneLife && window.HakoneShopArt')
        check('Shop art loaded at a real HTTP origin',page.evaluate('HakoneShopArt.version')=='1.0')
        check('Starter coins unchanged',page.evaluate('HakoneLife.snapshot().coins')==50)
        report=page.evaluate('''() => {
          const A=HakoneArt, D=HakoneData, floorHashes=[], iconHashes=[];
          const digest=(ctx,w,h)=>{let n=2166136261,painted=0;const a=ctx.getImageData(0,0,w,h).data;for(let i=0;i<a.length;i++){n=Math.imul(n^a[i],16777619);if(i%4===3&&a[i])painted++;}return [n>>>0,painted];};
          const before=JSON.stringify(HakoneLife.snapshot());
          for(const room of Object.keys(D.shops)) {
            const cv=document.createElement('canvas');cv.width=640;cv.height=480;const c=cv.getContext('2d');
            A.ground(c,room,0);const h=digest(c,640,480)[0];floorHashes.push(h);
            A.ground(c,room,999);if(digest(c,640,480)[0]!==h)throw Error('Unstable cached floor: '+room);
          }
          for(const id of Object.keys(D.items)) {
            const cv=document.createElement('canvas');cv.width=28;cv.height=28;const c=cv.getContext('2d');
            A.itemIcon(c,id,0,0);const [hash,painted]=digest(c,28,28);if(painted<15)throw Error('Blank item: '+id);iconHashes.push(hash);
          }
          return {floors:floorHashes.length,uniqueFloors:new Set(floorHashes).size,icons:iconHashes.length,uniqueIcons:new Set(iconHashes).size,cachedFloors:HakoneShopArt.cachedFloors,cachedIcons:HakoneShopArt.cachedIcons,stateUntouched:before===JSON.stringify(HakoneLife.snapshot())};
        }''')
        check('All eight rooms have distinct cached floors',report['floors']==report['uniqueFloors']==report['cachedFloors']==8,report)
        check('All 28 inventory icons are distinct and nonempty',report['icons']==report['uniqueIcons']==report['cachedIcons']==28,report)
        check('Rendering leaves player state untouched',report['stateUntouched'])
        page.evaluate("HakoneLife.enter('seven')")
        page.wait_for_function("HakoneLife.snapshot().room==='seven'")
        geometry=page.evaluate('''()=>{
          const list=HakoneLife.objects(),before=JSON.stringify(list),c=document.createElement('canvas').getContext('2d');
          for(const o of list)HakoneArt.prop(c,o,0,HakoneLife.snapshot());
          return before===JSON.stringify(list);
        }''')
        check('Object positions and interaction data unchanged',geometry)
        def close():
            if page.locator('#panel').evaluate('(e)=>e.open'):
                page.locator('#panelClose').click()
        def interact(id):
            close()
            page.evaluate('(id)=>HakoneLife.interact(HakoneLife.objects().find(o=>o.id===id))',id)
        def buy(shelf,label):
            interact(shelf)
            page.locator('.item').filter(has=page.locator('strong',has_text=label)).get_by_role('button',name='Buy',exact=True).click()
            close()
        buy('shelf2','Frozen smoothie cup')
        interact('blender');page.get_by_role('button',name='Prepare Frozen smoothie cup',exact=True).click()
        check('New blender art retains real smoothie preparation',page.evaluate('HakoneLife.snapshot().bag.smoothie===1 && HakoneLife.snapshot().bag.smoothieCup===0'))
        buy('shelf0','Bento lunch box')
        interact('microwave');page.get_by_role('button',name='Prepare Bento lunch box',exact=True).click()
        check('New microwave art retains real bento preparation',page.evaluate('HakoneLife.snapshot().bag.warmBento===1 && HakoneLife.snapshot().bag.bento===0'))
        buy('shelf2','SEVEN CAFE cup')
        interact('coffee');page.get_by_role('button',name='Prepare SEVEN CAFE cup',exact=True).click()
        check('New coffee machine art retains brewing',page.evaluate('HakoneLife.snapshot().bag.cafe===1 && HakoneLife.snapshot().bag.cafeCup===0'))
        check('Purchases charge original prices only',page.evaluate('HakoneLife.snapshot().coins')==7)
        page.reload();page.wait_for_function('window.HakoneShopArt && window.HakoneLife')
        check('Prepared items survive native-storage reload',page.evaluate('HakoneLife.snapshot().bag.smoothie===1 && HakoneLife.snapshot().bag.warmBento===1 && HakoneLife.snapshot().bag.cafe===1'))
        check('Reload does not grant starter coins twice',page.evaluate('HakoneLife.snapshot().coins')==7)
        page.screenshot(path=str(OUT/'seven-eleven.png'))
        page.locator('#fighterButton').click()
        check('Sixteen-fighter selection preserved',page.locator('#panelBody > button').count()==16)
        close();page.locator('#arenaTab').click()
        page.frame_locator('#arenaFrame').locator('#c1').wait_for()
        check('Arena retains sixteen fighters',page.frame_locator('#arenaFrame').locator('#c1 option').count()==16)
        page.wait_for_function("document.getElementById('arenaFrame').contentWindow.SpriteAnimations?.ready('Gojo') && document.getElementById('arenaFrame').contentWindow.SpriteAnimations?.ready('Toji')")
        page.locator('#leaveFight').click()
        check('Leaving fight restores the shop room',page.evaluate("HakoneLife.snapshot().mode==='town' && HakoneLife.snapshot().room==='seven'"))
        check('Leaving fight awards no coins',page.evaluate('HakoneLife.snapshot().coins')==7)
        page.set_viewport_size({'width':390,'height':850})
        page.screenshot(path=str(OUT/'seven-eleven-mobile.png'))
        check('390px page does not overflow',page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
        check('No JS exceptions',not errors,errors)
        check('No failed script or sprite requests',not [u for u in failed if '.js' in u or '.png' in u],failed)
        print(json.dumps({'passed':len(results),'results':results,'screenshots':str(OUT),'scope':'Native localhost origin; not public GitHub Pages'},indent=2))
        context.close();browser.close()
finally:
    server.shutdown();server.server_close()
