# Furnished interiors, reliable interactions, grounded fighters

## Authorized scope — November 9, 2026
James asked for actual 7-Eleven aisles; ramen benches/tables and furniture in
other buildings; researched, improved pixel art for new characters; no floating;
and fixed interactions with everything. Target: November 9, 8:45 PM Pacific.
Baseline main: 13cfe96d536f7f3861e1d7a5d8368db5a7ec07c1.
Work branch: hakone-interactions-grounding. Do not touch classic root or preview/.
Three finite follow-up passes are scheduled for 6, 7 and 8 PM Pacific, with an
8:45 PM progress check. This is not continuous execution or a guarantee of perfection.

## Implemented candidate
- adventure/interiors.js: data-driven room layouts and original pixel furnishings.
  7-Eleven has three double-sided aisles, chilled drink/food fridges, hot-food
  counter, checkout and eat-in furniture. Ramen has two dining tables, benches
  and five counter stools. Soba has low tables/cushions/tea; gifts has display
  islands/checkout; dojo gear rack/stretch mat; onsen cubbies/wash stations/stools;
  ryokan reception/tea table/futons; station ticket counter/waiting benches.
  New furniture is an interaction object, not an inaccessible picture.
- adventure/interaction.js: shared access-point geometry, facing-aware nearest
  target, line-of-sight collision checks and grid pathfinding. Broad shelves
  work from their sides. Click/tap walks to the requested object and opens it
  only on arrival; movement cancels. E uses the highlighted target; Q cycles
  nearby targets. Panel focus returns to the canvas when closed.
- adventure/town.js integrates the above and adds meaningful furniture services:
  resting, bag access, room menus, washing, stretching, travel and checkout/NPC
  actions. Stale/unknown objects are rejected. Internal room entry remains an
  exposed fixture/API helper, not a security boundary for this local-only game.
- Outdoor tree collisions now use trunks, allowing passage under foliage. The
  two trees originally in the river were moved to the east bank with IDs kept.
- adventure/arena_art.js redraws fourteen expansion fighters as original cached
  100x80 pixel frames: distinct hair, clothing, weapons and wider silhouettes.
  Shoes use sole anchor 74 rather than full image height. Idle/walk clips loop
  instead of freezing at their last frame. Torso movement does not lift planted
  feet; jumps and falls retain bent-leg poses. Gojo/Toji PNGs remain unchanged.
- Existing prices, save keys, 16-character abilities, upgrades, coin awards,
  food effects, classic root page and all preview files remain unchanged.

## Bugs caught during implementation
A route initially left corners 1–2 pixels early and could inch forever toward a
collision edge near the station table. Waypoints now snap precisely within a
small arrival tolerance before turning; tested with real browser movement.
A broad painted tree canopy blocked access behind the dojo; trunk collisions
and actual multi-side reachability tests replace the old single-anchor check.

## Tests / evidence
Local Chromium: 42 town source checks and 84 arena source checks passed. Town
handler fixtures inject a position helper ONLY into test HTML, never into the
shipped game. Tests run the actual JS, canvas and keyboard with a declared
in-memory localStorage substitute; these are not public-origin playthroughs.
New tests/test_hakone_interactions.py passed 34 checks in local inline mode:
154 object routes across the outdoors and eight rooms, correct pointer approach,
E/Q targets, cancelling, fridge purchase, seats/table menus, cubbies/wash/gear/
travel, mobile width and no JS exceptions. Pixel-alpha checks verified the sole
anchor on all 462 grounded frames across fourteen fighters. Counts are assertions,
not 462 human playthroughs. Source renderings were visually inspected.
Local HTTP navigation is blocked by this runtime's browser policy. The new test
DEFAULTS to a real localhost HTTP origin and native localStorage in GitHub CI;
HAKONE_TEST_MODE=inline is an explicit local-only fallback. Existing native-origin
and shop-preparation tests must also pass in branch CI before main publication.

## Pixel-art research and reuse
- Raymond Schlitter / SLYNYRD, Pixelblog 29, Anime Faces and Hair:
  https://www.slynyrd.com/blog/2020/7/28/pixelblog-29-anime-faces-and-hair
- Pixelblog 52, Idle Fighting Stance:
  https://www.slynyrd.com/blog/2024/9/26/pixelblog-52-idle-fighting-stance
- Pixelblog 53, Punches and Kicks:
  https://www.slynyrd.com/blog/2024/11/25/pixelblog-53-punches-and-kicks
- Pixelblog 35, Top Down Interiors:
  https://www.slynyrd.com/blog/2021/11/30/pixelblog-35-top-down-interiors
Studied silhouettes, cloth planes, grounded stances, anticipation/contact/recovery
and readable furniture scale. These are reference credits, not copied assets.
Snow-Hex's Yuji/Choso scene was reviewed but its page disallows derivatives, so no
pixels were imported. Mochi's Kashimo pack is paid and was not purchased or used.
All replacement graphics are original code-rendered cached pixel artwork; not
licensed downloads or ripped sprite sheets. Reference links are in game credits.

## Next scheduled passes
1. Inspect this log, current main and branch before making any edit.
2. Check branch CI and deployment; fix real failures before adding anything.
3. Verify user-visible interactions/navigation, directional sprite readability,
   leave-fight and persistence, especially touch and awkward corners.
4. Favor stabilization before the 8:45 PM report. Do not overwrite concurrent
   work, force-push, or claim any unpublished branch change is live.

## Branch validation — November 9, 2026, 5:26 PM Pacific
Exact source commit ea4dcb047f37ead3c9b279f78c1cde714decb87f passed
GitHub Actions run 42735446809, job 129563427184:
https://github.com/ScripterJames/gojo-vs-toji/actions/runs/42735446809
The job logs confirm all five suites passed, 200 assertions in total:
- 42 town source checks: explicit Storage/position fixtures, real Chromium.
- 84 arena source checks: controlled clock/storage, real Chromium.
- 21 native-localhost-origin integration checks: actual iframe/PNG loading,
  shared saved upgrades and coins, reload, reward and return-to-town behavior.
- 19 native-localhost-origin shop checks: purchase, preparation, persistence,
  original prices, distinct art, sixteen fighters, no abandon reward.
- 34 NEW native-localhost-origin checks: production click-to-walk and E/Q,
  154 reachable object routes, useful furnishings, exact sole bounds of 462
  grounded frames, animation loops, mobile page fit and no JS exceptions.
The new suite ran with real HTTP and native localStorage, NOT inline fallback.
A second local inline run also passed after the final icon/notice cleanup.
These are automated checks, not 200 full human matches or a public-site playthrough.
All twelve uploaded file blobs match the locally tested bytes. The compare
contains only adventure/, tests/, this document and the regression workflow;
root index.html and preview/ are unchanged.
This documentation-only follow-up changes no tested runtime/test source.
Next step: checked fast-forward of main and separate Pages deployment verification.
