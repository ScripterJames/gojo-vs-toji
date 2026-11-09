"""Real-Chromium checks of the separate Hakone Arena (not a hosted-origin test).

Loads the committed JS and HTML source into page.set_content. Uses an explicit
in-memory localStorage double and disables automatic animation frames so attacks
can be advanced deterministically. This does NOT test legacy image downloads,
real-origin persistence, or live network loading of a deployed page.
"""
from pathlib import Path
import json
import re
import os
import shutil
import tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
A = ROOT / "adventure"
OUT = Path(tempfile.mkdtemp(prefix="hakone-arena-test-"))
html = (A / "arena.html").read_text()
for src in [
    "arena_animation.js", "../preview/js/abilities.js",
    "roster.js", "arena_art.js", "arena_upgrades.js"
]:
    source_file = (A / src).resolve()
    js = source_file.read_text()
    html, count = re.subn(
        r'<script src="' + re.escape(src) + r'\?v=[^"]+"></script>',
        lambda _: "<script>" + js + "</script>",
        html,
        count=1
    )
    assert count == 1, "Could not inline " + src

# No cross-origin iframe or real storage is involved in this source-level suite.
html = html.replace(
    '<script>',
    """<script>
    window.__testStore = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: k => window.__testStore[k] ?? null,
        setItem: (k,v) => {window.__testStore[k]=String(v)},
        removeItem: k => {delete window.__testStore[k]}
      }, configurable: true
    });
    // Manual clocking for deterministic fighter physics and hit windows.
    window.requestAnimationFrame = () => 0;
    </script><script>""",
    1
)

checks = []
def check(name, condition, detail=None):
    assert condition, f"{name}: {detail!r}"
    checks.append(name)

with sync_playwright() as p:
    executable = (os.environ.get("CHROMIUM_EXECUTABLE")
                  or shutil.which("chromium") or shutil.which("chromium-browser"))
    browser = p.chromium.launch(
        executable_path=executable, headless=True,
        args=["--no-sandbox", "--disable-dev-shm-usage"])
    page = browser.new_page(viewport={"width": 1200, "height": 950})
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    page.set_content(html)
    page.wait_for_timeout(150)
    roster = page.evaluate("HakoneRoster.roster")
    check("Fourteen playable choices", len(roster) == 14, roster)
    for name in ["Toge", "Panda", "Nanami", "Yuta", "Choso", "Todo"]:
        check(name + " has a sprite", page.evaluate(
            "(n) => HakoneArtFighters.ready(n)", name))
        check(name + " has a special description", bool(page.evaluate(
            "(n) => HakoneRoster.descriptions[n]", name)))
        check(name + " has an upgrade bank", page.evaluate(
            "(n) => !!UpgradeShop.levels[n]", name))
    check("Initial 50 coins", page.evaluate("UpgradeShop.coins") == 50)
    check("Arena has 14 options for each player",
          page.locator("#c1 option").count() == 14
          and page.locator("#c2 option").count() == 14)

    controls = "{left:'arrowleft',right:'arrowright',jump:'arrowup',jumpAlt:' ',punch:'f',kick:'d',special:'a'}"
    def start(name, enemy="Gojo", gap=110):
        page.locator("#c1").select_option(name)
        page.locator("#c2").select_option(enemy)
        page.locator("#mode").select_option("pvp")
        page.locator("#start").click()
        page.evaluate("""gap => {
            fighters[0].x=200;
            fighters[1].x=200+gap;
            for(const k of Object.keys(keys)) delete keys[k];
        }""", gap)

    def cast(frames):
        page.keyboard.down("a")
        result = page.evaluate(f"""() => {{
            const f=fighters[0], other=fighters[1];
            const control={controls};
            for(let i=0;i<{frames};i++) updateF(f,other,control,false);
            draw();
            return {{hp:other.hp,stun:other.hitstun,guard:f.invul,
                     cooldown:f.specialCool,hit:f.stompHit,ratio:f.ratio}};
        }}""")
        page.keyboard.up("a")
        return result

    start("Toge", gap=130)
    x = cast(10)
    check("Keyboard A triggers Cursed Speech with stun",
          x["hp"] == 95 and x["stun"] >= 40, x)

    start("Toge", gap=500)
    x = cast(25)
    check("Speech misses beyond its reach", x["hp"] == 100, x)

    start("Panda", gap=100)
    x = cast(16)
    check("Guard Stomp damages once", x["hp"] == 82 and x["hit"], x)
    check("Panda keeps a brief defensive window", x["guard"] > 0, x)

    start("Nanami", gap=125)
    x = cast(16)
    check("Delayed Ratio strike connects", x["hp"] == 76, x)

    start("Nanami", gap=180)
    page.keyboard.down("a")
    page.evaluate(f"""() => {{
        for(let i=0;i<6;i++)updateF(fighters[0],fighters[1],{controls},false);
        fighters[1].x=780;
        for(let i=0;i<25;i++)updateF(fighters[0],fighters[1],{controls},false);
    }}""")
    page.keyboard.up("a")
    check("Ratio can be dodged during wind-up",
          page.evaluate("fighters[1].hp") == 100)

    check("Purchase new fighter upgrade",
          page.evaluate('UpgradeShop.buy("Nanami","technique")'))
    check("Upgrade costs 35 and saves level",
          page.evaluate("UpgradeShop.coins") == 15 and
          json.loads(page.evaluate(
              'window.__testStore["gojo-vs-toji-upgrade-levels-v1"]'
          ))["Nanami"]["technique"] == 1)
    start("Nanami", gap=120)
    check("Purchased special rank applies in fight",
          page.evaluate("fighters[0].specialPower") == 1)

    # Additional styles: reactive defense, charged ranged attack, and position swapping.
    start("Yuta", gap=160)
    page.keyboard.down("a")
    page.evaluate(f"""() => {{
        updateF(fighters[0],fighters[1],{controls},false);
        fighters[0].hp=82;
        updateF(fighters[0],fighters[1],{controls},false);
    }}""")
    page.keyboard.up("a")
    check("Rika counters a close attack once",
          page.evaluate("fighters[0].rikaTriggered && fighters[0].hp==87 && fighters[1].hp==78"))
    page.evaluate(f"""() => {{
        for(let i=0;i<20;i++)updateF(fighters[0],fighters[1],{controls},false);
    }}""")
    check("Rika cannot counter twice",page.evaluate("fighters[1].hp")==78)

    start("Yuta", gap=600)
    page.keyboard.down("a")
    page.evaluate(f"""() => {{
        updateF(fighters[0],fighters[1],{controls},false);
        fighters[0].hp=70;updateF(fighters[0],fighters[1],{controls},false);
    }}""")
    page.keyboard.up("a")
    check("Rika has bounded counter reach",page.evaluate("fighters[1].hp")==100)

    start("Choso",gap=380)
    x=cast(16)
    check("Piercing Blood hits distant opponent",x["hp"]==80,x)
    start("Choso",gap=650)
    x=cast(27)
    check("Piercing Blood cannot hit beyond 555px",x["hp"]==100,x)
    start("Choso",gap=330)
    page.keyboard.down("a")
    page.evaluate(f"""() => {{
        for(let i=0;i<8;i++)updateF(fighters[0],fighters[1],{controls},false);
        fighters[1].y=165;
        for(let i=0;i<19;i++)updateF(fighters[0],fighters[1],{controls},false);
    }}""")
    page.keyboard.up("a")
    check("Piercing Blood can be dodged vertically",page.evaluate("fighters[1].hp")==100)

    start("Todo",gap=185)
    x=cast(10)
    check("Boogie Woogie swaps positions and stuns",
          page.evaluate("fighters[0].x>fighters[1].x && fighters[1].hitstun>0 && fighters[1].hp==100"))
    start("Todo",gap=500)
    x=cast(23)
    check("Boogie Woogie misses distant target",
          page.evaluate("fighters[0].x<fighters[1].x && fighters[1].hitstun==0"))
    check("Boogie Woogie causes no direct HP damage",page.evaluate("fighters[1].hp")==100)

    # Render every new fighter with its real 2D canvas drawing path.
    for name in ["Toge", "Panda", "Nanami", "Yuta", "Choso", "Todo"]:
        start(name, "Gojo", gap=100)
        page.evaluate("draw()")
        check(name + " canvas contains colored pixels",
              page.evaluate("""() => {
                const pix=ctx.getImageData(200,310,70,138).data;
                let bright=0;
                for(let i=0;i<pix.length;i+=4){
                  if(pix[i]>140 && pix[i+1]>140 && pix[i+2]>100)bright++;
                }
                return bright>45;
              }"""))

    check("No JavaScript runtime exceptions", not errors, errors)
    page.screenshot(path=str(OUT / "arena-tested.png"), full_page=True)
    browser.close()

print(json.dumps({
    "passed": len(checks),
    "environment": "Real Chromium via page.set_content; mocked storage; no hosted-origin navigation",
    "report_directory": str(OUT),
    "checks": checks
}, indent=2))
