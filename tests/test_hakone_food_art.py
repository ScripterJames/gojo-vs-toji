"""Real Chromium source render and shop actions, with an explicit Storage double.
Compares the new layer to the actual previous renderers: 7-Eleven must be identical.
"""
from pathlib import Path
import re,os,shutil,tempfile,json
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];A=R/'adventure';OUT=Path(tempfile.mkdtemp(prefix='hakone-food-'))
h=(A/'index.html').read_text();h=re.sub(r'<script src="food_art.js\?v=[^"]+"></script>','',h)
h=re.sub(r'<script src="([^"?]+)\?v=[^"]+"></script>',lambda m:'<script>'+(A/m[1]).read_text()+'</script>',h)
h=h.replace('<script>',"<script>window.DB={'gojo-vs-toji-arcade-coins-v1':'100','gojo-vs-toji-upgrade-starter-v1':'yes'};Object.defineProperty(window,'localStorage',{value:{getItem:k=>DB[k]??null,setItem:(k,v)=>DB[k]=String(v)}});</script><script>",1)
checks=[]
def check(name,ok,detail=None):
 assert ok,(name,detail);checks.append(name);print('PASS '+name,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage']);page=b.new_page(viewport={'width':1100,'height':1000});errs=[];page.on('pageerror',lambda e:errs.append(str(e)));page.set_content(h);page.wait_for_function('window.HakoneLife')
 page.evaluate('''window.artDigest=room=>{const cv=document.createElement('canvas');cv.width=640;cv.height=480;const c=cv.getContext('2d');HakoneArt.ground(c,room,0);for(const o of HakoneInteriors.objects(room))HakoneArt.prop(c,{...o,scene:room},0,{room});return cv.toDataURL();};window.beforeFood={seven:artDigest('seven'),ramen:artDigest('ramen'),soba:artDigest('soba'),objects:JSON.stringify(HakoneLife.objects()),save:JSON.stringify(HakoneLife.snapshot())};''')
 page.add_script_tag(content=(A/'food_art.js').read_text())
 check('7-Eleven art remains pixel-for-pixel identical',page.evaluate("artDigest('seven')===beforeFood.seven"))
 check('Only ramen and soba rooms receive the food-market style',page.evaluate("HakoneFoodArt.rooms.length===2&&!HakoneFoodArt.affectsRoom('seven')&&artDigest('ramen')!==beforeFood.ramen&&artDigest('soba')!==beforeFood.soba"))
 check('Ramen and soba keep different visual treatments',page.evaluate("artDigest('ramen')!==artDigest('soba')"))
 check('Artwork does not mutate collisions, coins, bag or player',page.evaluate('JSON.stringify(HakoneLife.objects())===beforeFood.objects&&JSON.stringify(HakoneLife.snapshot())===beforeFood.save'))
 check('Ramen, soba and udon icons are visually distinct',page.evaluate("new Set(['ramen','soba','udon'].map(id=>{const c=document.createElement('canvas');c.width=c.height=32;HakoneArt.itemIcon(c.getContext('2d'),id,2,2);return c.toDataURL();})).size===3"))
 page.evaluate("for(const id of Object.keys(HakoneData.items)){const c=document.createElement('canvas').getContext('2d');HakoneArt.itemIcon(c,id,0,0);}")
 check('All 28 icons remain in the shared shop cache',page.evaluate('HakoneShopArt.cachedIcons===28'))
 check('Repeated noodle drawing does not grow the cache',page.evaluate("(()=>{const n=HakoneShopArt.cachedIcons,c=document.createElement('canvas').getContext('2d');for(let i=0;i<20;i++)HakoneArt.itemIcon(c,'ramen',0,0);return HakoneShopArt.cachedIcons===n;})()"))
 page.evaluate("HakoneLife.enter('ramen');HakoneLife.interact(HakoneLife.objects().find(o=>o.id==='shelf0'))")
 page.wait_for_function("document.getElementById('panel').open&&document.getElementById('panel').dataset.target==='shelf0'",timeout=15000)
 page.locator('.item').filter(has=page.locator('strong',has_text='Shoyu ramen')).get_by_role('button',name='Buy',exact=True).click()
 check('Restyled counter still sells real ramen at the original 26 coins',page.evaluate("HakoneLife.snapshot().coins===74&&HakoneLife.snapshot().bag.ramen===1"))
 page.keyboard.press('Escape');page.keyboard.press('b');page.locator('.item').filter(has=page.locator('strong',has_text='Shoyu ramen')).get_by_role('button',name='Use').click()
 check('Purchased ramen can actually be eaten from the bag',page.evaluate("HakoneLife.snapshot().bag.ramen===0&&HakoneLife.snapshot().fullness===100"))
 page.keyboard.press('Escape');page.wait_for_timeout(60);page.locator('#world').screenshot(path=str(OUT/'ramen-after.png'))
 page.evaluate("HakoneLife.enter('soba')");page.wait_for_timeout(70);page.locator('#world').screenshot(path=str(OUT/'soba-after.png'))
 check('No JavaScript exceptions',not errs,errs);b.close()
print(json.dumps({'passed':len(checks),'checks':checks,'screenshots':str(OUT),'scope':'source-loaded Chromium, explicit Storage double; not public Pages'},indent=2))
