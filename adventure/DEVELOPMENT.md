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
