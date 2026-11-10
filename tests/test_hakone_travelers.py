"""Town travelers and research-informed scenery regression.
Default: real localhost HTTP + native localStorage, real Canvas/DOM/keyboard.
HAKONE_TEST_MODE=inline: explicit Storage double/set_content fallback for
sandboxes that block localhost; that mode does NOT establish native persistence.
Character selection uses the real existing selection handlers, not state setters.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json, os, re, shutil, tempfile
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
INLINE=os.environ.get('HAKONE_TEST_MODE')=='inline'
OUT=Path(tempfile.mkdtemp(prefix='hakone-travelers-'))
checks=[]
def check(label,ok,detail=None):
    assert ok,(label,detail)
    checks.append({'test':label,'detail':detail})
    print('PASS '+label,flush=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=None
if not INLINE:
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1150,'height':1000})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    def load(store=None):
        if INLINE:
            html=(ROOT/'adventure/index.html').read_text()
            html=re.sub(r'<script src="([^"?]+)\?v=[^"]+"></script>',lambda m:'<script>'+(ROOT/'adventure'/m[1]).read_text()+'</script>',html)
            stub='<script>window.DB='+json.dumps(store or {})+';Object.defineProperty(window,"localStorage",{value:{getItem:k=>DB[k]??null,setItem:(k,v)=>DB[k]=String(v)}});</script>'
            page.set_content(html.replace('<script>',stub+'<script>',1))
        else:page.goto(f'http://127.0.0.1:{server.server_port}/adventure/')
        page.wait_for_function('window.HakoneTravelers && window.HakoneSceneArt && window.HakoneLife')
    load()
    snap=lambda:page.evaluate('HakoneLife.snapshot()')
    check('Town art modules loaded',page.evaluate('HakoneTravelers.roster.length===16 && HakoneSceneArt.version===1'))
    check('Character button is explicit',page.locator('#fighterButton').inner_text().startswith('Character: Gojo'))
    check('Starter gift stays 50 coins',snap()['coins']==50)
    # Actual movement controls change the data passed to the renderer.
    for key,direction in [('ArrowRight','right'),('ArrowLeft','left'),('ArrowDown','down'),('ArrowUp','up')]:
        before=snap();page.locator('#world').focus();page.keyboard.down(key)
        try:page.wait_for_function('([d,x,y])=>{const s=HakoneLife.snapshot();return s.dir===d && Math.hypot(s.x-x,s.y-y)>6}',arg=[direction,before['x'],before['y']],timeout=10000)
        finally:page.keyboard.up(key)
        page.wait_for_timeout(50)
        check('Keyboard movement faces '+direction,snap()['dir']==direction)
    # Inspect the actual rendered pixels of all direction/phase frames.
    pixels=page.evaluate('''()=>{
      const A=HakoneTravelers,bad=[],diff=[],all=[];let count=0;
      function digest(cv){let h=2166136261;for(const n of cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data)h=Math.imul(h^n,16777619);return h>>>0;}
      for(const name of A.roster){const dirs=[];
        for(const dir of ['down','up','left','right'])for(let i=0;i<6;i++){
          const cv=A.frame(name,dir,i),px=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let max=-1,paint=0;
          for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(px[(y*cv.width+x)*4+3]){max=Math.max(y,max);paint++;}
          if(max+1!==A.metrics().soleY||paint<100)bad.push([name,dir,i,max,paint]);count++;
          if(i===0)dirs.push(digest(cv));
        }
        if(new Set(dirs).size!==4)diff.push(name);all.push(dirs[0]);
      }
      return {count,bad,diff,uniqueFronts:new Set(all).size,cache:A.frame('Gojo','left',3)===A.frame('Gojo','left',3),loop:digest(A.frame('Gojo','right',1))===digest(A.frame('Gojo','right',7)),moving:digest(A.frame('Gojo','right',0))!==digest(A.frame('Gojo','right',1))};
    }''')
    check('All 384 directional frames are grounded and nonempty',pixels['count']==384 and not pixels['bad'],pixels)
    check('Every traveler has four visually different directions',not pixels['diff'],pixels['diff'])
    check('All 16 characters have distinct front sprites',pixels['uniqueFronts']==16,pixels['uniqueFronts'])
    check('Walk frames animate, loop and are cached',pixels['cache'] and pixels['loop'] and pixels['moving'])
    # Character picker remains a wrapper over the original save/selection handlers.
    page.keyboard.press('c');page.wait_for_selector('[data-traveler]')
    check('C opens all sixteen town traveler cards',page.locator('[data-traveler]').count()==16)
    check('Picker explains town use and has portraits',page.locator('[data-traveler] canvas').count()==16 and 'walk around Hakone' in page.locator('#panelDesc').inner_text())
    names=page.evaluate('HakoneTravelers.roster')
    money=snap()['coins'];start_xy=(snap()['x'],snap()['y']);bag=snap()['bag']
    for name in names:
        if not page.locator('#panel').evaluate('(d)=>d.open'):
            page.locator('#fighterButton').click()
        page.locator(f'[data-traveler="{name}"]').click()
        check('Select '+name+' for peaceful town exploration',snap()['fighter']==name)
    check('Switching characters is free and preserves position/bag',snap()['coins']==money and (snap()['x'],snap()['y'])==start_xy and snap()['bag']==bag)
    before=snap()
    if INLINE:
        store=page.evaluate('DB');page.close();page=browser.new_page(viewport={'width':1150,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));load(store)
    else:page.reload();page.wait_for_function('window.HakoneTravelers && window.HakoneLife')
    check('Selected traveler survives '+('Storage-contract reload' if INLINE else 'native browser reload'),snap()['fighter']=='Mahito' and snap()['coins']==before['coins'] and snap()['bag']==before['bag'])
    page.keyboard.press('c');page.wait_for_selector('[data-traveler]')
    check('Current traveler is highlighted after reload',page.locator('[data-traveler="Mahito"]').get_attribute('aria-pressed')=='true')
    page.keyboard.press('Escape');page.wait_for_timeout(70)
    check('Picker closes back to canvas and restores normal panel layout',page.evaluate("document.activeElement.id==='world' && !document.getElementById('panelBody').classList.contains('traveler-grid')"))
    # Rendering cannot mutate player state or object geometry; environment caching works.
    art=page.evaluate('''()=>{const before=JSON.stringify(HakoneLife.snapshot()),obj=JSON.stringify(HakoneLife.objects());const cv=document.createElement('canvas');cv.width=1280;cv.height=800;const c=cv.getContext('2d');
      HakoneArt.ground(c,null,0);const first=cv.toDataURL();HakoneArt.ground(c,null,32);const second=cv.toDataURL();
      for(const n of HakoneTravelers.roster)HakoneArt.person(c,n,200,270,'right',4);
      return {same:before===JSON.stringify(HakoneLife.snapshot())&&obj===JSON.stringify(HakoneLife.objects()),water:first!==second,cached:HakoneSceneArt.cacheInfo().ground};}''')
    check('Scenery and traveler drawing never modify state or geometry',art['same'])
    check('Water animates while static terrain stays cached',art['water'] and art['cached'])
    page.locator('#bagButton').click();check('Bag menu remains normal after character chooser',page.locator('#panelTitle').inner_text()=='Your bag' and not page.locator('#panelBody').evaluate("e=>e.classList.contains('traveler-grid')"));page.keyboard.press('Escape')
    if not INLINE:
        page.locator('#arenaTab').click();frame=page.frame_locator('#arenaFrame');frame.locator('#c1').wait_for()
        check('Town traveler carries into real arena iframe',frame.locator('#c1').input_value()=='Mahito')
        page.locator('#leaveFight').click();check('Leave arena retains traveler, bag and coins',snap()['mode']=='town' and snap()['fighter']=='Mahito' and snap()['coins']==before['coins'] and snap()['bag']==before['bag'])
    page.set_viewport_size({'width':390,'height':844});page.keyboard.press('c');page.wait_for_selector('[data-traveler]')
    check('Mobile character menu fits viewport',page.evaluate("document.documentElement.scrollWidth<=innerWidth+1 && document.getElementById('panelBody').scrollWidth<=document.getElementById('panelBody').clientWidth+1"))
    page.screenshot(path=str(OUT/'traveler-picker-mobile.png'),full_page=True)
    page.keyboard.press('Escape');page.set_viewport_size({'width':1150,'height':1000});page.screenshot(path=str(OUT/'town-travelers.png'),full_page=True)
    check('No JavaScript exceptions',not errors,errors)
    browser.close()
finally:
 if server:server.shutdown();server.server_close()
print(json.dumps({'passed':len(checks),'checks':checks,'screenshots':str(OUT),'scope':'explicit inline/storage-double' if INLINE else 'real Chromium, native localhost origin/storage; not public Pages'},indent=2))
