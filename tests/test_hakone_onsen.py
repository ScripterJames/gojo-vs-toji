"""Onsen end-to-end regression: real Chromium keyboard, pointer and activity clock.
Default uses native localhost HTTP/storage and the actual arena iframe.
HAKONE_TEST_MODE=inline is a declared local fallback with Storage/set_content doubles.
Only the starting save/coins are seeded. Rinse/soak/exit use production UI and paths.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
import json,os,re,shutil,tempfile
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]; A=ROOT/'adventure'; OUT=Path(tempfile.mkdtemp(prefix='hakone-onsen-'))
INLINE=os.environ.get('HAKONE_TEST_MODE')=='inline'; checks=[]; server=None
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
if not INLINE:
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));Thread(target=server.serve_forever,daemon=True).start()
def check(name,ok,detail=None):
 assert ok,(name,detail)
 checks.append({'test':name,'detail':detail});print('PASS '+name,flush=True)
seed={'gojo-vs-toji-arcade-coins-v1':'200','gojo-vs-toji-upgrade-starter-v1':'yes','hakone-life-town-v1':json.dumps({'x':1080,'y':250,'room':None,'energy':20,'fullness':80,'fighter':'Gojo','bag':{},'flags':{}})}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  context=browser.new_context(viewport={'width':1100,'height':1050});page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def load(db=None):
   if INLINE:
    html=(A/'index.html').read_text()
    html=re.sub(r'<script src="([^"?]+)\?v=[^"]+"></script>',lambda m:'<script>'+(A/m[1]).read_text()+'</script>',html)
    setup='<script>window.DB='+json.dumps(db or seed)+';Object.defineProperty(window,"localStorage",{value:{getItem:k=>DB[k]??null,setItem:(k,v)=>DB[k]=String(v)}});</script>'
    page.set_content(html.replace('<script>',setup+'<script>',1))
   else:
    if db is not None:
     page.add_init_script('''(()=>{if(!sessionStorage.getItem('onsenSeeded')){for(const[k,v]of Object.entries(%s))localStorage.setItem(k,v);sessionStorage.setItem('onsenSeeded','yes');}})();'''%json.dumps(db))
    page.goto(f'http://127.0.0.1:{server.server_port}/adventure/')
   page.wait_for_function('window.HakoneLife && window.HakoneOnsenArt && window.HakoneTravelers')
  load(seed)
  def snap():return page.evaluate('HakoneLife.snapshot()')
  def close():
   if page.locator('#panel').evaluate('(d)=>d.open'):page.keyboard.press('Escape');page.wait_for_timeout(60)
  def click_object(id,wait=True):
   close()
   xy=page.evaluate('''id=>{const s=HakoneLife.snapshot(),o=HakoneLife.objects().find(o=>o.id===id),r=document.getElementById('world').getBoundingClientRect();if(!o)throw Error('Missing '+id);const cx=Math.round(Math.max(0,Math.min((s.room?640:1280)-640,s.x-320))),cy=Math.round(Math.max(0,Math.min((s.room?480:800)-400,s.y-220)));return {x:r.x+(o.x+o.w/2-cx)*r.width/640,y:r.y+(o.y+o.h/2-cy)*r.height/400};}''',id)
   page.mouse.click(xy['x'],xy['y'])
   if wait:page.wait_for_function('id=>document.getElementById("panel").open&&document.getElementById("panel").dataset.target===id',arg=id,timeout=15000)
  page.locator('#world').focus();page.keyboard.press('e');page.wait_for_function('HakoneLife.snapshot().room==="onsen"')
  check('E enters the actual onsen doorway',snap()['room']=='onsen')
  check('Building entry does not charge a bathing fee',snap()['coins']==200)
  click_object('bath');check('Pool clearly explains washing first','First rinse' in page.locator('#panelDesc').inner_text())
  page.get_by_role('button',name='Go to a washing station').click()
  page.wait_for_function('document.getElementById("panel").open&&document.getElementById("panel").dataset.target==="wash0"',timeout=15000)
  check('Pool guide walks to a real washing station',snap()['activity'] is None and snap()['room']=='onsen')
  page.get_by_role('button',name='Wash and freshen').click();page.wait_for_function('HakoneLife.snapshot().activity?.kind==="wash"')
  check('Washing begins as an in-world timed activity',not page.locator('#panel').evaluate('(d)=>d.open'))
  page.keyboard.press('Escape');check('Escape cancels unfinished washing without charging',snap()['activity'] is None and not snap()['onsenWashed'] and snap()['coins']==200)
  click_object('wash0');energy=snap()['energy'];page.get_by_role('button',name='Wash and freshen').click()
  page.wait_for_function('HakoneLife.snapshot().onsenWashed && !HakoneLife.snapshot().activity',timeout=10000)
  check('A completed rinse actually marks this visit as washed',snap()['onsenWashed'])
  check('Rinse restores six energy and is free',snap()['energy']>=energy+5.9 and snap()['coins']==200,snap()['energy'])
  click_object('bath');check('Entry price remains 15 coins without an owned towel',page.get_by_role('button',name='Enter bath · 15 coins').count()==1)
  page.get_by_role('button',name='Enter bath · 15 coins').click();page.wait_for_function('HakoneLife.snapshot().activity?.kind==="soak"')
  s=snap();check('Traveler is visibly placed inside the pool',176<s['x']<464 and 132<s['y']<232,s)
  check('Bath charges once on entry',s['coins']==185)
  check('Step out button is visible and enabled',page.locator('#interactButton').is_enabled() and 'Step out' in page.locator('#interactButton').inner_text())
  e=s['energy'];page.wait_for_function('e=>HakoneLife.snapshot().energy>e+8',arg=e,timeout=10000)
  check('Soaking restores energy gradually, not an instant menu reward',snap()['energy']<100 and snap()['coins']==185,snap()['energy'])
  page.locator('#world').screenshot(path=str(OUT/'onsen-soaking.png'))
  page.keyboard.press('e');s=snap()
  check('E exits to a safe walkable shore without another fee',s['activity'] is None and not page.evaluate('s=>HakoneLife.blocked(s.x,s.y)',s) and s['coins']==185,s)
  click_object('towels');page.locator('.item').filter(has=page.locator('strong',has_text='Onsen towel')).get_by_role('button',name='Buy',exact=True).click();close()
  check('Towel can be bought from the real shelf',snap()['bag']['towel']==1 and snap()['coins']==167)
  click_object('bath');page.get_by_role('button',name='Enter bath · 8 coins').click();page.wait_for_function('HakoneLife.snapshot().activity?.kind==="soak"')
  check('Owning a towel gives the original 8-coin entry fee',snap()['coins']==159)
  page.locator('#interactButton').click();check('Visible Step out works for pointer/touch users',snap()['activity'] is None and snap()['coins']==159)
  click_object('bath');page.get_by_role('button',name='Enter bath · 8 coins').click();page.wait_for_function('HakoneLife.snapshot().activity?.kind==="soak"')
  page.keyboard.press('ArrowLeft');check('Movement key safely exits the pool',snap()['activity'] is None and not page.evaluate('s=>HakoneLife.blocked(s.x,s.y)',snap()))
  # Changing traveler uses existing real chooser, not a production state setter.
  page.keyboard.press('c');page.locator('[data-traveler="The Strongest of History"]').click()
  check('New boss is selectable as a town traveler',snap()['fighter']=='The Strongest of History')
  click_object('bath');page.get_by_role('button',name='Enter bath · 8 coins').click();page.wait_for_function('HakoneLife.snapshot().activity?.kind==="soak"');page.evaluate('HakoneLife.save()')
  before=snap();saved=page.evaluate('JSON.parse(localStorage.getItem("hakone-life-town-v1"))')
  check('Mid-bath saves store the safe shore, never the blocked water',not page.evaluate('s=>HakoneLife.blocked(s.x,s.y)',saved) and (saved['x'],saved['y'])!=(before['x'],before['y']),saved)
  if INLINE:
   store=page.evaluate('DB');page.close();page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));load(store)
  else:page.reload();page.wait_for_function('window.HakoneLife && window.HakoneOnsenArt')
  s=snap();check('Reload resumes safely in the onsen with character and coins kept',s['room']=='onsen' and s['activity'] is None and s['fighter']=='The Strongest of History' and s['coins']==before['coins'] and not page.evaluate('s=>HakoneLife.blocked(s.x,s.y)',s),s)
  check('Reload does not replay bath fees or the starter gift',s['coins']==before['coins'])
  click_object('wash0');page.get_by_role('button',name='Wash and freshen').click();page.wait_for_function('HakoneLife.snapshot().onsenWashed',timeout=10000)
  click_object('bath');page.get_by_role('button',name='Enter bath · 8 coins').click();page.wait_for_function('HakoneLife.snapshot().activity?.kind==="soak"')
  money=snap()['coins'];page.locator('#arenaTab').click()
  if not INLINE:
   page.frame_locator('#arenaFrame').locator('#c1').wait_for();check('Boss traveler carries into the actual arena',page.frame_locator('#arenaFrame').locator('#c1').input_value()=='The Strongest of History')
  page.locator('#leaveFight').click();s=snap()
  check('Leaving for a fight cancels soaking and returns safely afterwards',s['room']=='onsen' and s['activity'] is None and s['coins']==money and not page.evaluate('s=>HakoneLife.blocked(s.x,s.y)',s),s)
  # From the pool, the southern door can be outside the current viewport.
  # Walk onto visible open floor first, exactly as a pointer player would.
  page.wait_for_timeout(80)
  xy=page.evaluate('''()=>{const s=HakoneLife.snapshot(),r=document.getElementById('world').getBoundingClientRect(),cy=Math.round(Math.max(0,Math.min(80,s.y-220)));return{x:r.x+320*r.width/640,y:r.y+(350-cy)*r.height/400};}''')
  page.mouse.click(xy['x'],xy['y']);page.wait_for_function('Math.hypot(HakoneLife.snapshot().x-320,HakoneLife.snapshot().y-350)<4',timeout=15000)
  click_object('exit',wait=False);page.wait_for_function('HakoneLife.snapshot().room===null',timeout=15000)
  check('The actual onsen exit returns outdoors',snap()['room'] is None)
  check('Leaving the building resets washing for the next visit',not snap()['onsenWashed'])
  check('No JavaScript exceptions',not errors,errors)
  browser.close()
finally:
 if server:server.shutdown()
print(json.dumps({'passed':len(checks),'checks':checks,'screenshots':str(OUT),'scope':'explicit inline/Storage double' if INLINE else 'native localhost HTTP/storage with actual iframe'},indent=2))
