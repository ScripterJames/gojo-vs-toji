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



## Session 4: November 9, 2026, around 03:03 PST — three more playable fighters

### Implemented on the expansion branch
- Expanded Hakone Arena and town selection from 11 to **14 fighters** with Yuta, Choso and Todo. Both arena selectors, town traveler picker, dojo, and town-to-arena fighter handoff use the expanded roster. Existing /index.html and /preview/ remain untouched. Shared save keys, prices (35/70/105), starter gift (50 once), and victory coins (35) are unchanged.
- **Yuta: Rika Guard.** Six-second counter window. When hit, Yuta recovers 5 HP and a nearby Rika apparition retaliates once for 22 HP. Rika cannot attack across the map or repeat the counter; the Special upgrade increases restoration and counter damage. This defensive style intentionally differs from Megumi's repeated dog hits.
- **Choso: Piercing Blood.** A 15-frame windup gives opponents time to jump or get out of the narrow vertical beam (555px maximum reach). A connection deals 20 HP once; special ranks boost damage.
- **Todo: Boogie Woogie.** A delayed clap swaps the two fighters when they are nearby, briefly stuns the opponent and grants evasion to Todo. Out-of-range casts miss; the swap itself deals zero HP damage. Special ranks lengthen the stun and protection.
- Built original palette-distinct cached 64×50 arena frames and 28×38 traveler frames for all three, with readable hair, outfit, special poses and grounded hit effects. Existing cached strike architecture remains in place. Original Gojo/Toji image atlases are still used.
- Updated actual Chromium test scripts for 14 names, selection, new ability timing, counter-once behavior, dodging and canvas rendering. No purchases or copied proprietary sprites.

### Verified in this run
- **10 executable direct V8 checks** passed on the modified roster (including 14 names; one-time counter, bounded range, long-range narrow shot and jump miss, Todo swap/no damage, and Special scaling). Canvas drawing and caching paths for the three new fighters passed **15 additional smoke-render calls** with deliberately mocked canvas methods. This is not a real hosted-browser visual inspection.
- The GitHub Actions Chromium workflow was triggered on the branch; runs from intermediate partial commits can fail because the expanded 14-character roster was not integrated into tests until the final source commit. Check the run for the final integration SHA before reporting Chromium success.
- Research: ORICON profiles for [Todo's Boogie Woogie](https://oricon-group.com/news/3331/) and [Choso's Piercing Blood](https://us.oricon-group.com/news/2923/); SLYNYRD [Pixelblog 56](https://www.slynyrd.com/blog/2025/5/23/pixelblog-56-top-down-character-attack-animation) for windup, controlled smear, follow-through and recovery timing. Character moves, values and art are original gameplay adaptations, not exact canonical abilities/assets.

### Remaining issues / next work
1. Check the **final** branch Chromium regression results, inspect any failures and fix before moving the branch to main. After that, verify Pages deployment; a passing local source test alone is not live deployment.
2. Investigate actual hosted-origin storage and embedded arena exit/return flow in a real browser. Previous Chromium tests use page.set_content with a declared in-memory localStorage substitute, not real origin persistence or live iframe navigation.
3. Finish the two remaining aspirational roster members, Jogo and Mahito, in the next bounded increment if tests permit; polish Hakone shop interiors, vending/7-Eleven machines, and character silhouette distinctions.

## Session 5: November 9, 2026, approximately 04:00 PST — complete the original sixteen-fighter roster

### Implemented and checked on the expansion branch
- **All sixteen planned characters are now selectable** in the separate Hakone Arena and town; the new fighters are **Jogo** and **Mahito**. Earlier fourteen remain intact. The original root and /preview/ files, coin storage keys, starter gift and four upgrade costs/levels are unchanged.
- **Jogo — Volcanic Eruption:** a fixed-position orange ground warning lasts ~22 frames before one blast for 22 HP (plus 5 per Special rank). The impact area is limited to 77px horizontally and 98px vertically; movement or a jump can escape. It respects invulnerability, cannot double-hit and recharges after 390 frames. Its arena and town sprites have an original volcanic orange crown, dark cloak and single-eye silhouette, with a pixel-art warning and eruption phase.
- **Mahito — Idle Transfiguration:** a telegraphed frontal touch after 11 frames within 128px, causing 16 HP (plus 4 per Special rank) and a 150-frame temporary movement slowdown (plus 30 frames per rank). Damage and slow require an actual hit; distance and invulnerability block both. Fighter movement integrates the 0.65 slowdown multiplier without stopping jumping, and the timer decreases normally. Its original arena/town silhouettes use pale blue flowing hair, muted clothes, and patchwork marks.
- Both share the existing three-level Strength / Health / Speed / Special upgrade bank, CPU and PvP controls, fighter-to-town handoff and nonlethal Blue/competitive Toji mechanics. Attack poses are cached at whole-pixel boundaries with clear anticipation, impact and recovery. New scripts have versioned URLs.
- Browser regression checks were updated in both tests/test_hakone.py and tests/test_hakone_arena.py for sixteen selections and rendered sprites, Jogo warning/dodge/invulnerability, Mahito range/evasion/slowness and rank scaling.

### Tests completed and limitations
- **10 direct executable V8 ability checks passed**: sixteen roster entries, Jogo single delayed hit and dodge, both fighters' Special scaling, Mahito slow and single-hit constraints, range and invulnerability. No DOM/browser claims from these checks.
- **6 separate mocked-canvas sprite draws** for Jogo and Mahito passed with 42 distinct paint colors recorded, plus a sprite cache reuse assertion. These confirm callable draw paths, **not** visual fidelity in live browser.
- **GitHub Actions real Chromium regression, branch SHA 45151dfa56dcaee1756cfda5d9b61822c1090930: PASS** ([run 42613626410](https://github.com/ScripterJames/gojo-vs-toji/actions/runs/42613626410)). Both town and arena jobs passed. Like previous suites, they use page.set_content, explicit test storage doubles, and a deterministic manual combat clock; they do **not** prove hosted-origin persistence or full live iframe behavior.
- Original artwork, characters and fictional abilities are adapted for this fan game, not traced assets. Pixel-art motion methodology from author Raymond Schlitter's [Pixelblog 56](https://www.slynyrd.com/blog/2025/5/23/pixelblog-56-top-down-character-attack-animation): use anticipation, crisp smear/impact, follow-through, recovery with restrained pixels; [Pixelblog 22](https://www.slynyrd.com/blog/2019/10/21/pixelblog-22-top-down-character-sprites): readable silhouettes at small sizes. The game world and shop prices remain fictional.

### Still to do
1. Verify actual hosted-origin browser storage, delivered PNG assets and town→arena→town iframe navigation, preferably with an origin-serving Playwright integration test; no browser/storage double for this test. Confirm real service availability separately.
2. Visually inspect all sixteen sprites at native and scaled sizes, compare readable move anticipation and frames; refine silhouettes and town machine/shop furnishings rather than simply adding characters.
3. Evaluate CPU balance across the full roster, particularly Jogo warning/dodge and Mahito slowdown against Toji's dash and Gojo's nonlethal Blue. Record genuine tests before making tuning claims.


## Session 6: November 9, 2026, approximately 05:15 PST — real-origin local-browser integration

### Changes made
- Added **tests/test_hakone_origin.py**, a new Playwright/Chromium integration test that runs the actual repository over a local **HTTP server** (127.0.0.1, random ephemeral port). It does not use page.set_content, inlined game scripts, iframe stubs, mocked localStorage methods, or artificial game-loop timing.
- Updated **.github/workflows/hakone-browser-tests.yml** to run the new test alongside the existing town and arena suites, including on changes to the new test file.
- Corrected the town UI's out-of-date "fourteen fighters" wording to **sixteen** in **adventure/index.html**; this was a text-only change. No combat, shop, upgrade or save engine was modified, and **root /index.html and /preview/ were untouched**.
- The initial integration test revealed that deliberately overwriting a save key immediately before a page reload is unreliable: the *old tab's existing pagehide save handler* correctly writes its in-memory state back over the test's manually edited key. Fixed the test setup by starting a fresh same-origin tab and performing a one-time native localStorage spawn adjustment before town.js initializes. This is a test-fixture issue, not evidence that the game loses progress.

### Actually verified
- **GitHub Actions run [42623473089](https://github.com/ScripterJames/gojo-vs-toji/actions/runs/42623473089) passed** on tested branch SHA **9b2c3b1bb0cb08d2897c456ab2d5e788456ba1d6**.
- **21 checks** passed in Chromium with a **real localhost HTTP origin**, the browser's **native localStorage**, a real same-origin arena iframe and real PNG asset loading. This verified: startup gift once; town keyboard movement; vending purchase and persisted bag; Mahito selection and purchased Strength rank surviving reload; all sixteen arena options; Gojo and Toji PNG atlases actually loaded; upgrade rank applied to Mahito's arena punch; actual CPU-win reward logic paying 35 coins; live cross-frame storage event updating the town wallet; Escape and the visible Leave fight button returning to town; combat preserving the player's town inventory; keyboard E entering/exiting 7-Eleven; room save surviving reload; no JS exceptions or failed game script/sprite resources.
- The CPU reward path used a **deliberately reduced opponent HP** in the real running browser, followed by an actual keyboard punch. This tests the reward and synchronization path; it **does not** establish that a complete unmodified CPU match is balanced or winnable.
- The same Actions run passed **42 existing town checks** and **66 existing arena checks**, which still use in-memory page HTML and disclosed storage doubles. These results are separate from the 21 native-origin checks.

### Boundaries and next priorities
1. This validates a locally served site at a real origin, **not the public scripterjames.github.io origin**. Public Pages deployment, CDN freshness, real user device/browser saves, and a complete naturally played fight are not yet proven by this test.
2. Inspect all sixteen sprites and storefront interiors *visually* at native and scaled sizes, then improve silhouette contrast, motion phases, vending/7-Eleven props, floor tiles and depth sorting. Avoid disturbing existing working interactions.
3. Test CPU difficulty and fairness across the full roster, including Gojo Blue (five seconds, nonlethal) and Toji's one-hit dash, in longer natural matches.
4. Maintain the baseline: 50 starter coins once, +35 per CPU win, individual persistent Strength/Health/Speed/Special ranks at 35/70/105 coin costs, town as separate game mode, and every placed item interactive.


### Session 6 follow-up — regression stabilization before publication
A subsequent documentation-triggered workflow run on SHA 93487f55 failed the **pre-existing 250ms fixed-delay keyboard-movement assertion** in tests/test_hakone.py under a heavily delayed Chromium frame (no game code had changed). Updated that town test to focus the canvas and wait until the character actually moves more than 5px while holding ArrowRight, instead of assuming animation frames arrive within 250ms. This changes **test reliability only**, not gameplay timing or controls. [Branch run 42624074372](https://github.com/ScripterJames/gojo-vs-toji/actions/runs/42624074372) passed all three suites on SHA **69a22d27d4d15a09dc29188551ffa27f74e3ada5**: 42 town, 66 arena, and 21 native-localhost-origin checks. Do not mistake the failed intermediate regression run for a shipped game defect or conceal the test instability.


## Session 7: November 9, 2026 — CPU special coverage and combat fairness

### Discovered defect and production changes
- Inspected current `main`, `hakone-town-expansion`, the original development spec and current arena/town/Chromium tests before editing. Both branches initially pointed to `001c8524403f53ee7254aab481c5f6ac54229e0d`.
- Reproduced a concrete AI defect with a deterministic V8 combat harness: the **Gojo CPU never cast Blue**; the **Toji CPU had no offensive special**, only a backwards evasive dash in response to a threatened attack. This meant the opponent's signature moves did not match the player-controlled fighters.
- In `adventure/arena.html`, Gojo's CPU may now cast Blue when an opponent is approximately 65–420 px away and its cooldown has expired. Toji now chooses an **evasive backwards dash** when threatened by Blue or melee, or an **offensive forward striking dash** from approximately 105–245 px when not threatened. The existing 22-frame dash invulnerability, one-hit damage, special cooldown and player-controlled dash direction are unchanged.
- Kept Hakari, Sukuna, Megumi and all other CPU special triggers unchanged. No changes to root index, `/preview/`, town items/interiors, save keys, upgrade costs, coins or character art.

### Executed tests and limits
- **5 direct V8 behavior checks passed on the candidate source** before commit: CPU Gojo starts Blue, CPU Toji starts a forward dash, Toji's forward dash lands exactly one 23-HP hit, Toji still retreats from active Blue, and CPU Hakari retains Jackpot.
- Added deterministic, *real Chromium* regression checks to `tests/test_hakone_arena.py` for CPU Gojo, Toji offense and defense, and CPU special activation for each of the other fourteen fighters. Those browser checks require the GitHub Actions runner for final execution; do not claim they passed merely because the source was committed.
- These tests verify character-special access and a controlled one-hit sequence, **not** player win-rate balance, realistic human control or a full public GitHub Pages match. Public-origin playthrough and 16-fighter CPU fairness sampling remain outstanding.

### Next priorities
1. Trigger the existing Chromium regression workflow on `hakone-town-expansion` and inspect results; fix failures before merging to main, verify Pages release.
2. Run longer realistic CPU-versus-CPU (or scripted player-versus-CPU) matches with seeded randomness across the full roster and record win/loss, duration and stalemate rates; tune only based on observed results.
3. Inspect rendered sprite frames and storefront interiors at native pixel resolution; refine silhouettes, contact effects, lighting and practical interior detail without disturbing E interactions.


### Session 7 branch validation — November 9, 2026
- GitHub Actions [run 42632918057](https://github.com/ScripterJames/gojo-vs-toji/actions/runs/42632918057) **passed** on exact branch commit `c6353ba5242bf1007ff23665ea952b5be1888872` after the new CPU AI changes and tests. Parsed job logs confirm **42 town Chromium checks, 84 arena Chromium checks (66 existing plus 18 new deterministic CPU-special checks), and 21 real-localhost-origin Chromium integration checks**.
- The 18 new arena checks verify Gojo CPU casts Blue, Toji CPU offensive direction/hit and defensive direction, and one AI special activation per remaining 14 fighters. All passed on actual Chromium; this does **not** establish difficulty fairness or public-origin persistence.
- The tested game changes were fast-forwarded to `main` with a checked expected branch head. Pages deployment for that commit is checked separately; do not conflate the regression success with CDN publication.
