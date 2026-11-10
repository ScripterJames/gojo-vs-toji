"""Real-origin, same-origin iframe integration test for Hakone Life.

Unlike the source-level suites, this serves the checked-out repository with a
real local HTTP origin and uses Chromium's native localStorage, image loading,
keyboard events, and iframe navigation. It is NOT a test of the public Pages
deployment. A combatant's HP is lowered explicitly to exercise the actual
CPU-win reward path without relying on unpredictable AI match duration.

Run from the repository checkout: python tests/test_hakone_origin.py
Requires playwright and an installed Chromium.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
import os
import shutil
import tempfile

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
COINS = "gojo-vs-toji-arcade-coins-v1"
LEVELS = "gojo-vs-toji-upgrade-levels-v1"
GIFT = "gojo-vs-toji-upgrade-starter-v1"
SAVE = "hakone-life-town-v1"
checks = []
out = Path(tempfile.mkdtemp(prefix="hakone-origin-test-"))

def check(name, ok, detail=None):
    assert ok, f"{name}: {detail!r}"
    checks.append(name)

class SilentHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(
    ("127.0.0.1", 0), partial(SilentHandler, directory=str(ROOT))
)
Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}"

try:
    with sync_playwright() as p:
        binary = (os.environ.get("CHROMIUM_EXECUTABLE")
                  or shutil.which("chromium") or shutil.which("chromium-browser"))
        browser = p.chromium.launch(
            executable_path=binary, headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"]
        )
        context = browser.new_context(viewport={"width": 1200, "height": 960})
        page = context.new_page()
        exceptions = []
        bad_resources = []
        page.on("pageerror", lambda err: exceptions.append(str(err)))
        page.on("response", lambda r: bad_resources.append(f"{r.status} {r.url}")
                if r.status >= 400 and r.url.startswith(base)
                else None)

        response = page.goto(base + "/adventure/", wait_until="load")
        check("Game served over a real HTTP origin",
              response.status == 200 and page.evaluate(
                  "() => location.protocol === 'http:' && !!window.HakoneLife"))
        page.wait_for_function(
            "() => !!localStorage.getItem('hakone-life-town-v1')")
        initial = page.evaluate("""() => ({
          coins:localStorage.getItem('gojo-vs-toji-arcade-coins-v1'),
          gift:localStorage.getItem('gojo-vs-toji-upgrade-starter-v1'),
          town:JSON.parse(localStorage.getItem('hakone-life-town-v1')),
          storageIsNative:localStorage.getItem === Storage.prototype.getItem
        })""")
        check("Native browser storage and one-time starter gift",
              initial["storageIsNative"] and initial["coins"] == "50"
              and initial["gift"] == "yes" and initial["town"]["fighter"] == "Gojo",
              initial)

        start_x = page.evaluate("HakoneLife.snapshot().x")
        page.keyboard.down("ArrowRight")
        page.wait_for_function('(x)=>HakoneLife.snapshot().x>x+5',arg=start_x,timeout=10000)
        page.keyboard.up("ArrowRight")
        check("Real keyboard town movement",
              page.evaluate("HakoneLife.snapshot().x") > start_x + 5)

        # Test a genuine shop dialog/purchase without modifying any storage.
        page.evaluate("""() => HakoneLife.interact(
          HakoneLife.objects().find(o => o.id === 'vending1'))""")
        page.locator(".item").filter(
            has=page.locator("strong", has_text="Mineral water")
        ).get_by_role("button", name="Buy", exact=True).click()
        wallet = page.evaluate("HakoneLife.snapshot()")
        check("Vending purchase uses shared real storage",
              wallet["coins"] == 45 and wallet["bag"]["water"] == 1, wallet)
        page.locator("#panelClose").click()

        page.locator("#fighterButton").click()
        page.get_by_role("button", name="Mahito · Idle Transfiguration").click()
        page.locator("#upgradeButton").click()
        page.locator(".item").filter(
            has=page.locator("strong", has_text="Strength")
        ).get_by_role("button", name="35 coins").click()
        page.locator("#panelClose").click()
        state_before = page.evaluate("HakoneLife.snapshot()")
        check("Chosen fighter's upgrade debits shared wallet",
              state_before["fighter"] == "Mahito" and state_before["coins"] == 10
              and json.loads(page.evaluate(
                  f"localStorage.getItem('{LEVELS}')"))["Mahito"]["power"] == 1)
        page.reload(wait_until="load")
        page.wait_for_function("() => !!window.HakoneLife")
        restored = page.evaluate("HakoneLife.snapshot()")
        check("Native browser reload restores wallet, bag, fighter, gift",
              restored["coins"] == 10 and restored["bag"]["water"] == 1
              and restored["fighter"] == "Mahito"
              and page.evaluate(f"localStorage.getItem('{GIFT}')") == "yes",
              restored)

        # The real arena iframe is loaded from the same HTTP origin: no srcdoc
        # or stubbed contents and no page.set_content used in this test.
        page.locator("#arenaTab").click()
        iframe = page.frame_locator("#arenaFrame")
        expect(iframe.locator("#c1")).to_have_value("Mahito")
        check("Real arena iframe loads seventeen characters",
              iframe.locator("#c1 option").count() == 17)
        expect(iframe.locator("#game")).to_be_visible()
        page.wait_for_function("""() => {
          const w=document.getElementById('arenaFrame').contentWindow;
          return !!w && !!w.SpriteAnimations &&
                 w.SpriteAnimations.ready('Gojo') &&
                 w.SpriteAnimations.ready('Toji');
        }""", timeout=10000)
        check("Original fighter PNG atlases load in genuine iframe", True)
        check("Arena and town share native localStorage origin",
              page.evaluate(f"""() => {{
                const w=document.getElementById('arenaFrame').contentWindow;
                return w.location.origin===location.origin &&
                       w.localStorage.getItem('{COINS}') === '10' &&
                       JSON.parse(w.localStorage.getItem('{LEVELS}')).Mahito.power===1;
              }}"""))

        # This fixture checks a single win, storage and leaving; the separate
        # strongest suite tests the enabled ladder and its changing countdown.
        # Use the real checkbox so "wins!" is a stable single-fight result,
        # not the one-frame text before "Round won! Next challenger" replaces it.
        iframe.locator("#autoNext").uncheck()
        iframe.locator("#start").click()
        arena = page.frame(url=lambda url: url.startswith(base + "/adventure/arena.html"))
        assert arena is not None, "Arena frame did not load"
        fight = arena.evaluate("""() => ({
          playing, p1:fighters[0].name,
          upgradedPunch:fighters[0].punchPower,
          enemy:fighters[1].name, mode:mode.value
        })""")
        check("Mahito starts CPU battle with purchased strength upgrade",
              fight["playing"] and fight["p1"] == "Mahito"
              and fight["upgradedPunch"] == 9
              and fight["mode"] == "cpu", fight)

        # Lower the enemy's HP explicitly, then use the real keyboard punch,
        # game loop, localStorage write, and cross-frame storage event to earn.
        arena.evaluate("""() => {
          fighters[1].hp=1;
          fighters[1].x=fighters[0].x+90;
          fighters[1].y=fighters[0].y;
          fighters[1].hitstun=100;
          fighters[1].hitDirection=0;
          fighters[1].invul=0;
        }""")
        iframe.locator("#c1").focus()
        page.keyboard.down("f")
        expect(iframe.locator("#status")).to_contain_text(
            "wins!", timeout=5000
        )
        page.keyboard.up("f")
        check("CPU-win code credits exactly 35 shared coins",
              arena.evaluate(f"localStorage.getItem('{COINS}')") == "45")
        page.wait_for_function(
            "() => document.getElementById('wallet').textContent === '45 coins'",
            timeout=5000
        )
        check("Parent HUD reacts to iframe's real storage event", True)

        # Prove the Escape key leaves a loaded fight, not merely an empty frame.
        iframe.locator("#start").click()
        iframe.locator("#c1").focus()
        page.keyboard.press("Escape")
        expect(page.locator("#townView")).to_be_visible()
        check("Escape returns from live arena to original town",
              page.locator("#arenaFrame").get_attribute("src") == "about:blank"
              and page.evaluate("HakoneLife.snapshot().mode") == "town")
        check("Town bag and selected character survived combat",
              page.evaluate("""() => {
                const s=HakoneLife.snapshot();
                return s.bag.water===1 && s.fighter==='Mahito';
              }"""))

        # Also exercise the visible Leave fight button separately.
        page.locator("#arenaTab").click()
        expect(page.frame_locator("#arenaFrame").locator("#start")).to_be_visible()
        page.locator("#leaveFight").click()
        expect(page.locator("#townView")).to_be_visible()
        check("Visible Leave fight button unloads arena",
              page.locator("#arenaFrame").get_attribute("src") == "about:blank")

        page.reload(wait_until="load")
        check("Real-origin storage survives second reload with reward",
              page.evaluate("HakoneLife.snapshot().coins") == 45
              and page.evaluate("HakoneLife.snapshot().fighter") == "Mahito"
              and page.evaluate("HakoneLife.snapshot().bag.water") == 1)

        # Open a NEW tab for the doorway spawn. The old town tab's pagehide
        # handler saves on navigation, so modifying its localStorage immediately
        # before reload would correctly be overwritten by its still-live state.
        # A one-time init script sets the new tab's genuine origin storage BEFORE
        # town.js initializes. sessionStorage prevents respawn on later reloads.
        page.close()
        page = context.new_page()
        page.on("pageerror", lambda err: exceptions.append(str(err)))
        page.add_init_script(script=f"""(() => {{
          if (sessionStorage.getItem('__hakone_test_spawn')) return;
          const key='{SAVE}',s=JSON.parse(localStorage.getItem(key));
          s.room=null;s.x=152;s.y=224;
          localStorage.setItem(key,JSON.stringify(s));
          sessionStorage.setItem('__hakone_test_spawn','yes');
        }})()""")
        page.goto(base + "/adventure/", wait_until="load")
        page.wait_for_function("() => !!window.HakoneLife")
        page.locator("#world").focus()
        page.wait_for_timeout(120)
        page.keyboard.press("e")
        check("Keyboard E opens 7-Eleven via actual origin state",
              page.evaluate("HakoneLife.snapshot().room") == "seven",
              page.evaluate("""() => ({
                position:[HakoneLife.snapshot().x,HakoneLife.snapshot().y],
                room:HakoneLife.snapshot().room,
                prompt:document.getElementById('prompt').textContent
              })"""))
        page.keyboard.press("e")
        check("Keyboard E leaves 7-Eleven and saves room state",
              page.evaluate("HakoneLife.snapshot().room") is None)
        page.reload(wait_until="load")
        check("Shop exit persists through reload",
              page.evaluate("HakoneLife.snapshot().room") is None)

        check("No page JavaScript exceptions", not exceptions, exceptions)
        check("No failed local script or sprite resources", not bad_resources,
              bad_resources)
        page.screenshot(path=str(out / "origin-town.png"), full_page=True)

        context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()

print(json.dumps({
    "passed": len(checks),
    "checks": checks,
    "environment": "Chromium + actual localhost HTTP origin, native localStorage, real iframe and PNG loads; NOT the public GitHub Pages site",
    "artifact_dir": str(out)
}, indent=2))
