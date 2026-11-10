"""Actual Chromium + shipped arena source; explicit clock/Storage doubles.
Checks the new 17th fighter and deterministic auto-next behavior, not human balance.
No hosted-origin or downloadable-image claims are made by this suite.
"""
from pathlib import Path
import json, os, re, shutil, tempfile
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
A=ROOT/'adventure'; BOSS='The Strongest of History'; OUT=Path(tempfile.mkdtemp(prefix='hakone-strongest-'))
html=(A/'arena.html').read_text()
html=re.sub(r'<script src="([^"?]+)\?v=[^"]+"></script>',lambda m:'<script>'+(A/m[1]).resolve().read_text()+'</script>',html)
setup='''<script>window.__clock=100;window.DB={};
Object.defineProperty(window,'localStorage',{value:{getItem:k=>DB[k]??null,setItem:(k,v)=>DB[k]=String(v),removeItem:k=>delete DB[k]}});
Object.defineProperty(performance,'now',{value:()=>window.__clock});window.requestAnimationFrame=()=>0;</script>'''
html=html.replace('<script>',setup+'<script>',1)
checks=[]
def check(name,ok,detail=None):
 assert ok,(name,detail)
 checks.append({'test':name,'detail':detail});print('PASS '+name,flush=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1100,'height':1050});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html);page.wait_for_function('window.HakoneArena && window.UpgradeShop')
 def start(name=BOSS,other='Gojo',mode='pvp',gap=110):
  page.locator('#c1').select_option(name);page.locator('#c2').select_option(other);page.locator('#mode').select_option(mode);page.locator('#autoNext').check();page.locator('#start').click()
  page.evaluate('gap=>{fighters[0].x=200;fighters[1].x=200+gap;}',gap)
 def frames(n,full=False):
  page.evaluate('''([n,full])=>{for(let i=0;i<n;i++){__clock+=1000/60;if(full)loop(__clock);else updateF(fighters[0],fighters[1],{punch:'f',kick:'d',special:'a'},false);}}''',[n,full])
 def snap():return page.evaluate('HakoneArena.snapshot()')
 check('All 17 names appear in both arena selectors',page.locator('#c1 option').count()==17 and page.locator('#c2 option').count()==17)
 start();s=snap()['fighters'];check('Boss starts with 500 HP, 35 punch, 55 kick',s[0]['hp']==500 and s[0]['punch']==35 and s[0]['kick']==55,s)
 ratios=page.evaluate('''()=>{const a=UpgradeShop.base({name:'Gojo'}),b=UpgradeShop.base({name:'The Strongest of History'});return ['maxHp','punchPower','kickPower'].every(k=>b[k]===5*a[k])&&a.moveSpeed===b.moveSpeed;}''')
 check('Exactly 5x Gojo base HP and melee; movement speed unchanged',ratios)
 page.keyboard.down('f');frames(15);page.keyboard.up('f')
 check('Actual keyboard punch hits once for 35 HP',snap()['fighters'][1]['hp']==65,snap())
 start(gap=130);page.keyboard.down('d');frames(21);page.keyboard.up('d')
 check('Actual keyboard kick hits once for 55 HP',snap()['fighters'][1]['hp']==45,snap())
 start(other=BOSS);page.keyboard.down('a');frames(1);page.keyboard.up('a')
 check('A starts History’s Judgment',snap()['fighters'][0]['judgment']>0,snap())
 page.evaluate('''()=>{const f=fighters[0];__clock=f.judgmentStartedAt+999;HakoneRoster.tick(f,fighters[1]);}''')
 check('Judgment has a readable wind-up before damage',snap()['fighters'][1]['hp']==500)
 page.evaluate('''()=>{const f=fighters[0];for(let i=1;i<=5;i++){__clock=f.judgmentStartedAt+i*1000;HakoneRoster.tick(f,fighters[1]);}}''')
 check('Five timed slashes total 125 base damage',snap()['fighters'][1]['hp']==375 and snap()['fighters'][0]['judgment']==0,snap())
 page.evaluate('HakoneRoster.tick(fighters[0],fighters[1])')
 check('Expired Judgment cannot deal a sixth hit',snap()['fighters'][1]['hp']==375)
 for label,gap,invul in [('Range',600,0),('Invulnerability',110,999)]:
  start(other=BOSS,gap=gap)
  page.evaluate('(v)=>{fighters[1].invul=v;action(fighters[0],"special");__clock=fighters[0].judgmentStartedAt+5000;HakoneRoster.tick(fighters[0],fighters[1]);}',invul)
  check(label+' protects against Judgment',snap()['fighters'][1]['hp']==500,snap())
 start(other=BOSS)
 page.evaluate('action(fighters[0],"special"); fighters[0].hp=0; __clock+=5000; HakoneRoster.tick(fighters[0],fighters[1]);')
 check('Defeated boss cannot attack or keep Judgment active',snap()['fighters'][1]['hp']==500 and snap()['fighters'][0]['judgment']==0)
 start();page.evaluate('UpgradeShop.award(500);')
 check('New boss can buy a persistent Strength rank',page.evaluate('UpgradeShop.buy("The Strongest of History","power")'))
 start();check('Strength rank produces 45 punch and 70 kick',snap()['fighters'][0]['punch']==45 and snap()['fighters'][0]['kick']==70,snap())
 check('New boss can buy a Health rank',page.evaluate('UpgradeShop.buy("The Strongest of History","vitality")'))
 start();check('Health rank gives 560 HP',snap()['fighters'][0]['maxHp']==560)
 check('Boss ranks use the existing shared save key',page.evaluate('JSON.parse(localStorage.getItem("gojo-vs-toji-upgrade-levels-v1"))["The Strongest of History"].power===1'))
 check('New boss can buy a Special rank',page.evaluate('UpgradeShop.buy("The Strongest of History","technique")'))
 start(other=BOSS)
 page.evaluate('action(fighters[0],"special");__clock+=5000;HakoneRoster.tick(fighters[0],fighters[1]);')
 # Both PvP fighters apply the same purchased health rank: 560 - (125+25).
 check('Special rank adds 25 total Judgment damage',snap()['fighters'][1]['hp']==410,snap())
 start(name='Gojo',other=BOSS,mode='cpu',gap=170)
 page.evaluate('''()=>{const rand=Math.random;Math.random=()=>.1;try{updateF(fighters[1],fighters[0],{},true);}finally{Math.random=rand;}}''')
 check('CPU boss uses his unique special',snap()['fighters'][1]['judgment']>0)
 start(other=BOSS);page.evaluate('action(fighters[0],"special")');page.locator('#shopToggle').click();page.evaluate('__clock+=6000');page.locator('#shopToggle').click();page.evaluate('HakoneRoster.tick(fighters[0],fighters[1])')
 check('Opening the upgrade shop pauses Judgment without catch-up damage',snap()['fighters'][1]['hp']==560 and snap()['fighters'][0]['judgment']>0,snap())
 start(name='Gojo',other='Toji');page.evaluate('action(fighters[0],"special")');page.locator('#shopToggle').click();page.evaluate('__clock+=6000');page.locator('#shopToggle').click();frames(1)
 check('Shop pause also preserves Gojo’s five-second Blue timer',page.evaluate('fighters[0].blue>=298'))
 start(other='Toji',mode='cpu',gap=110)
 before=page.evaluate('UpgradeShop.coins')
 page.evaluate('fighters[1].hp=1;fighters[1].aiDelay=999;fighters[1].specialCool=999;')
 page.keyboard.down('f');frames(16,True);page.keyboard.up('f')
 s=snap();check('CPU KO queues the next character',s['next'] and s['next']['name']=='Hakari' and not s['playing'],s)
 check('One KO gives exactly 35 coins',page.evaluate('UpgradeShop.coins')==before+35)
 frames(20,True);check('Countdown does not pay another reward',page.evaluate('UpgradeShop.coins')==before+35)
 frames(120,True);s=snap();check('Next round starts automatically against Hakari',s['playing'] and s['round']==2 and s['fighters'][1]['name']=='Hakari',s)
 check('Fresh round restores player HP and clears old special effects',s['fighters'][0]['hp']==s['fighters'][0]['maxHp'] and s['fighters'][0]['judgment']==0,s)
 check('Next opponent wraps safely and skips the player',page.evaluate('nextOpponent("Mahito")==="Gojo"'))
 start(other='Toji',mode='cpu');page.evaluate('fighters[1].hp=0;finishRound();');before=page.evaluate('UpgradeShop.coins');page.locator('#autoNext').uncheck();frames(160,True)
 check('Unchecking Next challenger cancels the pending round',not snap()['playing'] and snap()['next'] is None and page.evaluate('UpgradeShop.coins')==before)
 start(other='Gojo',mode='pvp');before=page.evaluate('UpgradeShop.coins');page.evaluate('fighters[1].hp=0;finishRound();');frames(160,True)
 check('Two-player results do not auto-advance or award coins',not snap()['playing'] and snap()['next'] is None and page.evaluate('UpgradeShop.coins')==before)
 start(mode='cpu');before=page.evaluate('UpgradeShop.coins');page.evaluate('fighters[0].hp=0;finishRound();');frames(160,True)
 check('Losing stops the ladder without a victory reward',not snap()['playing'] and snap()['next'] is None and page.evaluate('UpgradeShop.coins')==before)
 metrics=page.evaluate('''()=>{const a=HakoneArtFighters,m=a.metrics(),bad=[];let frames=0;for(const key of ['idle','walk','punch','kick','special','hurt','defeated'])for(let i=0;i<({idle:8,walk:6,punch:6,kick:6,special:4,hurt:2,defeated:1}[key]);i++){const cv=a.frame('The Strongest of History',key,i),px=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let last=-1,count=0;for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(px[(y*cv.width+x)*4+3]){last=Math.max(y,last);count++;}if(last+1!==m.soleY||count<100)bad.push([key,i,last]);frames++;}return {frames,bad};}''')
 check('All 33 grounded boss frames have planted feet',metrics['frames']==33 and not metrics['bad'],metrics)
 start(other='Sukuna',gap=340);page.evaluate('draw()');page.locator('#game').screenshot(path=str(OUT/'strongest-arena.png'))
 check('No JavaScript exceptions',not errors,errors)
 browser.close()
print(json.dumps({'passed':len(checks),'checks':checks,'screenshots':str(OUT),'scope':'Actual Chromium with explicit clock/Storage doubles; not public Pages'},indent=2))
