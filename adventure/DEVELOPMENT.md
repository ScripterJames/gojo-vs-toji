# Hakone Life — development checkpoint

## Session 0: November 8, 2026, evening Pacific

### Implemented (not merely planned)
- Separate Hakone Life mode at /adventure/. Mode tabs switch between a top-down town and the existing /preview/ arena in an iframe. The original root and preview files are unchanged.
- 1280x800 fictional Hakone-inspired map, scrolling camera, solid buildings, traversable bridges, 8 enterable interiors.
- 7-Eleven, ramen restaurant, soba restaurant, sweets/woodcraft shop, dojo, onsen, ryokan, station.
- 28 inventory definitions (including prepared variants): mineral water, Iyemon tea, BOSS coffee, oolong tea, Pocari Sweat, tuna-mayo/salmon onigiri, egg salad sandwich, Nanachiki, steamed pork bun, oden, bento, smoothie cup, cafe cup, melon pan, ramen/curry/soba/udon, manju, castella-style manju, towel, clear umbrella, postcard, puzzle box. Product reference links are in game credits and docs/HAKONE_DEVELOPMENT.md. Inventory is a fictional selection; game prices and energy/fullness benefits are not real-world claims.
- Buy -> bag -> consume loop; bento -> microwave; frozen cup -> smoothie machine; cafe cup -> coffee machine; drink -> empty container -> recycle.
- Shared legacy coins and Gojo/Toji upgrade data: 50-coin starter gift only once; Strength/Health/Speed/Special, three levels at 35/70/105 coins. Existing arena CPU wins still award 35 coins through its unchanged code.
- Town needs: energy for running, fullness. No dying from hunger. Free benches/water tap prevent getting stuck without money. Meals currently affect peaceful town needs, NOT arena combat stats. Keep that distinction honest.
- Parcel delivery (25 coins once), six-building stamp reward (30 once), keyboard combo training (8 once), postcard reward (10 once), puzzle box reward (15 once).
- Fictional coin bank for storage, umbrella use in rain, towel discount at onsen, inn rest, shuttle travel, lamps on/off, NPC dialogue, cat petting, shrine pause, tree/stone/bridge/window inspection. Every placed object has an interaction; scenery interactions may be inspection.
- Leave Fight button resets the iframe to about:blank; Escape handler is attached to the same-origin arena when available. Town position/bag remain intact. No reward for abandoning a fight.
- Keyboard arrows/WASD, Shift run, E interact, B bag, U upgrades, M map; touch movement buttons and nearby-object clicking. Character selection currently only Gojo and Toji.
- Original low-res canvas artwork with a 16px material rhythm, quiet textures, subtle cast shadows, cached six-phase directional traveler sprites, pixelated scaling. This is first-pass art, not final polished anime fighter artwork.

### Source files
- adventure/index.html: mode UI and styling.
- adventure/data.js: products, shops, map, sources.
- adventure/art.js: rendering and sprite cache.
- adventure/town.js: movement, collisions, interaction menus, state, shops, missions, arena bridge.
- tests/test_hakone.py: executable regression suite.

### Tests actually executed
29 passing checks in real headless Chromium with candidate HTML/scripts loaded through page.set_content. This environment blocked network/file navigation, so the test uses an EXPLICIT in-memory Storage test double to verify the save contract. Real-origin persistence and the remote legacy iframe are NOT claimed as browser-tested. A separate no-storage case checks temporary-play fallback and its visible warning.
Checks: starter coins; real keyboard movement; vending purchase; consumption/trash; recycling; parcel pickup/delivery/no duplicate reward; bento preparation; smoothie preparation; coffee preparation; upgrade price; bank deposit/withdrawal/empty-bank protection; stamp reward/no duplicate; keyboard F,F,D training; character selection; save round-trip; separate mode switch; leave-arena frame reset; every object interaction handler; outdoor object reachability with BFS using actual collision geometry; E entering/exiting a shop; blocked-storage fallback; 390px mobile overflow; no JS runtime errors. Screenshots were inspected at desktop and mobile sizes. Node syntax checks passed.
Local tested source bytes matched committed Git blob hashes:
- index.html b4d3e8ccc127f010897d64512abf20b69323299f
- data.js 3ce9cda49efe3d92ede64c995329877bf7712282
- art.js fa170bb03adac54c870b59a63b943e23f838179b
- town.js 975b30a415681e8cbf27ca1f42e95e50900848f3

### Publication checkpoint
This checkpoint is on hakone-town-expansion. The initial interactive session will fast-forward main only after a fresh head check, then verify GitHub Pages. Future passes MUST inspect actual main and current run status rather than assuming publication from this note. Expected playable address after publication: https://scripterjames.github.io/gojo-vs-toji/adventure/

## Highest-priority next work
1. Verify live /adventure/ loading and browser-origin save integration where tool access allows. Test the unchanged /preview/ iframe properly when browser navigation is available, including Escape, sound ending on exit, and shared coin updates. Do not claim that test if unavailable.
2. ADD THE REQUESTED CHARACTERS. Hakari, Sukuna and Megumi are not implemented yet, despite existing draft Library files. Build a separate adventure/arena.html and modules, reusing the existing working preview sprites/engine without rewriting /preview/. Repoint town's iframe only when tested. Add corresponding town selection and upgrade support. Avoid another round of just promises.
3. Expand toward Gojo, Toji, Hakari, Sukuna, Megumi, Yuji, Nobara, Maki, Toge, Panda, Nanami, Yuta, Choso, Todo, Jogo, Mahito. Prefer fewer fully working unique abilities over many broken/recolored entries.
4. Art improvement and town polish: actual differentiated store interior flooring (7-Eleven currently shares wood flooring), signage for machines/shelves, richer item icons, more readable NPC identities, map visualization, cached background layers for performance. Current simple body art is a draft. Do not discard working interactions.

## Suggested fan-game mechanics (PLANS, NOT IMPLEMENTED)
Hakari: Jackpot temporary power/recovery buff, no real-money gambling.
Sukuna: three timed Cleave slashes.
Megumi: Divine Dog companion with bounded hit cooldown.
Yuji: close-range Black Flash lunge.
Nobara: nail projectile and delayed Resonance.
Maki: long-reach weapon sweep.
Toge: Cursed Speech brief stun with modest damage.
Panda: temporary guard and stomp.
Nanami: precision Ratio strike.
Yuta: bounded Rika assist/healing.
Choso: horizontal Piercing Blood projectile.
Todo: position swap and short follow-up buff.
Jogo: dodgeable ground eruption.
Mahito: long palm strike and temporary slow.
These are simplified design adaptations, not assertions of exact canon.

## Safety and workflow
Keep root index.html and preview/ unchanged. Read both branches before work; never force-push or overwrite concurrent work. Use expected-head checks. Add tests and update this file each session. Never claim the whole request is done while characters remain absent. No paid assets/services, accounts, telemetry, advertising or real-money mechanics. The user requested all-night work, implemented as 9 bounded hourly automation sessions around 11 PM–7 AM, not continuous execution. Provide one useful morning report with actual completed features and limitations.


## Session 1: November 8, 2026, late evening Pacific

### Implemented on the work branch
- Added **adventure/arena.html** as a separate arena for Hakone Life. Reused the tested legacy combat mechanics and the original Gojo/Toji sprite atlases without editing /preview/ or the root page.
- Added **Hakari**, **Sukuna**, **Megumi** as playable fighters (five total). Both player-selection dropdowns and CPU mode support them. The town passes the selected traveler in \`?p1=\`, so returning from Hakone Life into an arena match preserves character choice.
- **Hakari — Jackpot**: eight-second melee multiplier and bounded gradual HP regeneration, 11-second cooldown, no wagering/real money. Strong attack buff does not make him invincible.
- **Sukuna — Cleave**: three timed directional slash checks at midrange; 8 base HP per slash (up to 24 total), cooldown ~5.5 seconds. Opponents can evade by moving or breaking range.
- **Megumi — Divine Dog**: visible, following pixel-art companion that attacks only when close and no more than once per 80 frames; eight-second duration, ~9.5-second cooldown.
- Unique **original cached 64×50 raster fighter animation frames** (idle, walk, jump, punch, kick, special, hurt, defeated) for the new trio; different readable hair, silhouettes, outfits and colors. Strike frames were widened to prevent forward fists/feet clipping. Kept original image atlases for Gojo/Toji; this is a first-pass sprite treatment requiring visual playtesting.
- New adventure-only upgrade shop integrates the legacy localStorage keys for coins and levels, with per-fighter Strength, Health, Speed, Special ranks. Corrected an initial bug found by executing the page: the new roster needed its own rank objects, not just Gojo and Toji. Prices remain 35, 70, 105; starter gift only once and CPU wins +35.
- Updated town traveler selection, shop language, version indication and /adventure/arena.html iframe handoff. The classic /preview/ is still available unchanged at its old URL.
- Updated tests/test_hakone.py for the expanded fighter labels and the new arena iframe path; the existing 29 Chromium checks were NOT rerun in this session.

### Tests executed, with limitations
- Parsed and executed the actual new JS source in a V8 isolate with DOM/canvas/audio/storage test doubles; **18 passing behavior checks** (traveler URL, five roster entries, starter gift, purchase/persistence, Sukuna three strikes, Hakari timed buff/healing, Megumi dog damage, actual raster draw path, old Gojo Blue 5-second duration & nonlethal damage, Toji's 23-damage dash, 35-coin CPU reward exactly once, and town-to-arena handoff).
- **Not** a full real Chromium browser test. The test used mocked canvas, localStorage, requestAnimationFrame and iframe handoff. Storage persistence on the hosted Pages origin, actual image-asset load, visible sprite quality, audio shutdown and Escape/leave-fight behavior still require a browser-origin run. Do not report those as validated.
- All modified JS compiled successfully. Legacy root/index.html and preview/index.html were not modified.

### Research checked in this session
- SLYNYRD Pixelblog 55, https://www.slynyrd.com/blog/2025/3/24/pixelblog-55-top-down-character-animation : preserve readable silhouette, consistent pivots, and compare frames in motion.
- SLYNYRD Pixelblog 56, https://www.slynyrd.com/blog/2025/5/23/pixelblog-56-top-down-character-attack-animation : stage attack frames and preserve consistent joint poses across directional hits.
- Hakone Navi, https://www.hakonenavi.jp/international/en/spot/382 : Hakone-Yumoto shopping street has cafés, restaurants, manju, kamaboko and yosegi woodcraft. These were used as architectural/merchandise reference rather than copying assets. Current game town remains intentionally fictional.
- No paid art, purchased products or third-party sprites.

### Next high-value increment
1. Verify published /adventure/ and /adventure/arena.html in a real browser when possible; test iframe Escape, return to town, shared coins after a fight, loading original Gojo/Toji atlases, raster punch reaches and visual rhythm. If a browser is blocked, state the limitation explicitly.
2. Expand 2–3 genuinely distinct additional fighters (Yuji, Nobara, Maki suggested), update ranks/traveler sprites and test unique mechanics before claiming them live.
3. Give 7-Eleven a distinctive tile floor and readable machine signs; improve close-up interior object outlines and E prompts without breaking the existing 29 town interactions.
4. Keep performance stable by caching low-res frames; do not draw procedural sprites on every frame.


### Publication update — November 8, late evening PST
After verifying that main had not advanced, fast-forwarded main to commit \`fd47e0f69750d230a3ccd28a3bd158e2d695f647\`. GitHub Pages deployment run 42578801316 completed **successfully** (https://github.com/ScripterJames/gojo-vs-toji/actions/runs/42578801316). The newly published route should be \`/adventure/arena.html\`, linked from \`/adventure/\`. Direct external HTML/browser retrieval was blocked by the research browser and is **not** equivalent to live interaction testing. A further sprite-only V8 test verified three newly generated cached 64x50 strike frames, a visible forward punch silhouette with furthest painted x=57, and cache reuse across repeated draws. Preserve this caveat in morning reporting.

## Session 2: November 9, 2026, 00:09 PST — three additional fighters

### Implemented and integrated
- Expanded the separately hosted Hakone Arena from **five to eight playable fighters**. Added **Yuji** (Black Flash: a limited-range, single-hit lightning lunge), **Nobara** (Nail: a directional projectile, followed by a delayed Resonance hit only after contact), and **Maki** (Weapon Sweep: a long-range, one-hit staff strike). Cooldowns, damage upgrades, grounded range checks, hit sparks and visible effects are implemented.
- New CPU special selection uses the actual roster rather than a hard-coded three-name list; existing Hakari, Sukuna, Megumi, Gojo and Toji behaviors remain in place. Yuji's lunge locks facing until completion. Megumi can now walk during the Divine Dog summon rather than staying in the casting pose for its entire duration.
- Added original cached, character-distinct 64×50 pixel fighter frames for Yuji, Nobara and Maki (eight fighter choices total), and differentiated 28×38 top-down traveler sprites for town exploration. Character silhouettes/hair, clothes, accents and special overlays differ. Reused existing Gojo/Toji PNG atlases.
- Town traveler picker, indoor dojo picker, shared per-fighter upgrade bank, character URL handoff, both arena fighter selectors, mode title and cache-busting URLs updated. Preserved the preexisting \`/index.html\` and \`/preview/\` files and all town interactions/saves.
- Updated \`tests/test_hakone.py\` to inject scripts regardless of version suffix and added three town-selection checks (Yuji, Nobara, Maki). Fixed a regex-escaping typo detected while reviewing the runner. All previous town tests remain, but **the Python/Chromium town suite was not rerun in this session**.

### Tests actually executed
- **25 deterministic V8 checks passed** against current source loaded by GitHub: new roster and ability descriptions, town-to-arena URL selection, Yuji strike and out-of-range miss, Nobara nail plus delayed Resonance and invulnerability miss, Maki strike and out-of-range miss, cooldown guard, existing Hakari regeneration / Sukuna 3 Cleave hits / Megumi Divine Dog / Toji dash / Gojo five-second nonlethal Blue, starter gift, purchase and saved upgrade round-trip, Maki special upgrade damage, and three new cached raster fighter render paths plus cache reuse.
- Additional earlier checks: 6 direct ability behavior checks on the new roster; 6 raster drawing checks across the six procedurally cached fighter sprites; 16 prior integrated arena checks. The **25-check run is the latest consolidated result**; do not add totals together as independent full suites.
- These were executable V8 checks with **mocked DOM, canvas, Audio and localStorage**. They do **not** establish live in-browser input, audio, image readability, native browser-origin persistence, or iframe Escape/leave behavior. No deployed page playthrough was possible; remote GitHub Pages URL was inaccessible to the available browser. An independently run local Python regex check passed for the versioned-script injection in the Chromium test harness.
- Cache-busting script URLs updated to avoid old JS after publication. No 7-Eleven inventory or town gameplay logic was rewritten.

### Remaining and next task
1. Run the full \`python tests/test_hakone.py\` suite in **real Chromium** when a network-enabled checkout is available, followed by the integrated deployed /adventure/ → /adventure/arena.html → Leave Fight return path and browser-origin save tests.
2. Expand the roster incrementally toward the documented **16-character plan** with genuinely distinct animations and bounded special abilities. Suggested next: Toge (Cursed Speech stun), Panda (guard/stomp), Nanami (Ratio strike). Add actual regression tests for the new abilities.
3. Assess real silhouettes/frame rhythm in motion and improve town 7-Eleven tile floor, machine signs and E prompts; honor Pixelblog 20/21/35/55/56 techniques already recorded in the documentation. Final game world is a fictional Hakone-inspired map with fictional prices.


## Session 3: November 9, 2026, approximately 02:00 PST — 11 fighters and browser regression CI

### Implemented on the work branch (not automatically live)
- Expanded **Hakone Arena from eight to eleven playable fighters**, leaving the original root game and /preview/ untouched. Added **Toge Inumaki** (Cursed Speech: frontal, short-range stun with modest damage), **Panda** (Guard Stomp: short invulnerability window followed by a single local ground hit), and **Kento Nanami** (Ratio Strike: 7:3 precision cut with a clearly telegraphed wind-up, dodgeable before impact). Special damage and stun scale with each fighter's Special upgrade, capped by the existing three upgrade levels. Hits respect the defender's invulnerability and checking range/vertical positions.
- Added distinct, cached original 64x50 arena animation frames: Toge has pale hair and a high collar, Panda has a cream-and-black silhouette with ears and paws, and Nanami has swept light hair, glasses and tie. The town's 28x38 traveler sprite cache now contains distinct versions of all three, including Panda's white face.
- Updated both arena selectors, their special descriptions, selected-traveler persistence/arena URL handoff, the town picker, and cache-busting script URLs to 11-fighter versions. Every existing town shop and interactive object remains unchanged. No separate real-money economies were introduced; legacy coin and saved-upgrade keys are preserved.
- The arena combat facing update holds direction during the brief Toge and Nanami cast wind-ups; their attacks therefore cannot reverse mid-cast. The original Gojo Blue and Toji dash rules remain unchanged.
- Expanded tests/test_hakone.py to select the three new travelers. Added tests/test_hakone_arena.py, which uses **actual headless Chromium and page.set_content**, keyboard A presses and manual fighter stepping to assert stun, guard, one-hit stomp, Ratio hit/dodge, new upgrades and canvas pixel output. Created a 15-minute GitHub Actions browser regression workflow which invokes both town and arena tests on a supported Ubuntu 24.04 runner. This workflow was modeled on the official Playwright CI guidance: https://playwright.dev/python/docs/ci . The first CI run failed at browser installation because ubuntu-latest resolved to unsupported Ubuntu 26.04; the workflow was corrected to ubuntu-24.04. **Do not claim browser tests passed until the corrected run completes successfully.**

### Actual tests completed in this incremental implementation
- **22 deterministic V8 integrated arena checks passed** against the committed branch sources: 11 roster entries, incoming selection URL, Toge speech hit/stun/range/cooldown, Panda guard/stomp, Nanami Ratio hit/dodge, Gojo Blue nonlethal five-second regression, Toji 23-damage dash regression, Panda immunity against Ratio, starter gift, three-character upgrade bank and purchase/persistence, actual offscreen raster drawing for all three, and sprite-frame caching.
- **20 direct special-mechanics checks passed** while implementing roster.js (including invulnerability and Special scaling) and **12 additional sprite-cache/draw assertions** while adding artwork; these are supporting targeted checks and **not additive full browser suites**.
- These V8 checks used explicitly mocked browser interfaces. Browser-origin localStorage, hosted network access, original Gojo/Toji PNG loading, audio, and live iframe Escape/return still require actual browser verification. The new Chromium test suite uses a deliberate in-memory storage double, so even a successful CI run is not a production-origin persistence claim.
- Research technique: SLYNYRD Pixelblog 55 (https://www.slynyrd.com/blog/2025/3/24/pixelblog-55-top-down-character-animation) for silhouette and synchronized six-frame run cycles, Pixelblog 56 (https://www.slynyrd.com/blog/2025/5/23/pixelblog-56-top-down-character-attack-animation) for staged hit/recovery poses; Pixelblog 35 (https://www.slynyrd.com/blog/2021/11/30/pixelblog-35-top-down-interiors) for 16px interior-grid consistency. All new art is original, and no paid source sprites were used.

### Next priority
1. Inspect the current GitHub Actions **Hakone browser regression** run and, if failed, read actual job logs and fix the failing test or environment before declaring Chromium validation. Publish only after bounded checks and current main-head verification; verify Pages deployment.
2. Expand toward the planned 16-fighter roster with distinct specials and sprites: Yuta, Choso and Todo are suggested next. Keep balancing across the roster rather than adding superficial recolors.
3. Real hosted-browser town → arena → leave-and-return playthrough and origin persistence; visually inspect PNG legacy atlases versus new raster fighters. The 7-Eleven shop already has real product-inspired interactions; further art polish should improve tiled flooring, machine icons, and E prompt legibility without changing the established purchase/preparation/quest loops.

### Chromium CI verification, November 9, 2026 at approximately 02:05 PST
GitHub Actions [Hakone browser regression run 42598175333](https://github.com/ScripterJames/gojo-vs-toji/actions/runs/42598175333), commit 56e93b192f848c3aca1294dde03e976981d9223c, completed **successfully** on Ubuntu 24.04 with Playwright 1.60.0 and real headless Chromium.
- **37/37 town checks passed:** purchases, vending and 7-Eleven preparation, coins and stamp quests, keyboard movement and E doorway interaction, outdoor reachability, all eleven traveler choices, separate modes and leave-fight return, mobile layout and no JS exceptions.
- **25/25 separate arena checks passed:** eleven selectors, real keyboard A specials for Toge/Panda/Nanami, range and dodge limits, stun/guard, new canvas sprites, upgrades, and no JS exceptions.
- Both browser suites load checked-out HTML and JS via page.set_content with explicit in-memory localStorage test doubles and manually advanced arena frames. They do not prove live hosted-origin persistence, network loading, the live iframe Escape/audio shutdown path, or downloads of original Gojo/Toji PNG atlases. Those remain next priority.
- Earlier run 42597990938 failed before tests due unsupported Ubuntu 26.04. Workflow fixed to ubuntu-24.04 and subsequent CI above passed.

