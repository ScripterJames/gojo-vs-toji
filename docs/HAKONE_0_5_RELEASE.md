# Hakone Life 0.5 — release verification

## Tested source
- Source commit: `2285039a236230c890f3501908a5ec274b5def62`.
- Branch: `grounded-fighters-lived-in-shops`.
- GitHub Actions run: https://github.com/ScripterJames/gojo-vs-toji/actions/runs/42736214936
- Job: `129565988413`, Chromium town and arena checks.
- Result: all five suites completed successfully on November 9, 2026, California time (November 10 UTC).

## Completed changes
The fourteen newer arena fighters have original, individually designed pixel-art frames with planted feet, contact shadows and properly repeating idle/walk cycles. All sixteen characters and their existing unique abilities remain available. Gojo/Toji's existing PNG artwork and battle mechanics were not replaced. The new artwork uses 36 cached frames per fighter, 504 total; 490 grounded frames are checked against the exact floor, with 14 intentional airborne frames excluded from that grounding assertion.

All eight town interiors have usable furniture. 7-Eleven has three browsable walk-between aisles, chilled-drink fridges, a hot-food display, checkout, the existing preparation machines, a bench and recycling. Ramen and soba shops have order counters, stools, two dining tables, benches, tea and kitchen details. The gift shop, dojo, onsen, ryokan and station have distinct suitable furnishings. Furniture retains real menu/rest/service interactions; details such as the staff-only door offer clearly labeled inspection rather than pretending to be enterable rooms.

Keyboard E, pointer clicks and the Interact button now share one edge-based reach rule. Reach through intervening furniture is blocked; front doors are approached from outside. Highlighting agrees with the interaction prompt. Tab or the Next button cycles nearby objects. Closing menus restores movement focus. Sitting uses a seated pose and movement stands up. Old saved positions covered by new furniture relocate to nearby free space within the same room without discarding the bag or progression.

## Exact successful suite counts
1. Town regression: 42 checks.
2. Arena combat regression: 84 checks.
3. Native-localhost-origin integration: 21 checks.
4. Native-localhost-origin shop-art and preparation: 19 checks.
5. New furnishings, interaction and grounding regression: 346 checks.

Total: **512 passing assertions**. The final suite verifies approachability and actual keyboard E activation for **157 placed objects**, outdoors and in all eight interiors, plus mouse selection, Tab/Next cycling, range/obstruction rules, aisle access from both sides, focus recovery, seated rest, same-room save migration, frame clipping and grounded foot placement.

The 21- and 19-check suites use real HTTP localhost origins, native browser storage, real script/PNG downloads and the actual arena iframe. They verify saved purchases/prepared food/upgrades, reload, shared coins, leave-fight behavior and unchanged rewards/prices. The 42-, 84- and 346-check suites use real Chromium with page.set_content and explicit storage fixtures. Positions and some combat conditions are seeded; these are not 512 human playthroughs, 157 manually walked routes, or evidence of perfect character balance.

## Preserved scope
Root `index.html`, all `preview/` files, item prices, rewards, save-key names, roster mechanics and upgrade pricing are unchanged. Existing coins, bag items and upgrades remain compatible. Town walking sprites remain the existing original traveler art, with new seated poses; the detailed character redraw is for the arena.

## Research and remaining limits
Technique/design references are documented in `docs/HAKONE_ROOMS_GROUNDING.md` and the in-game credits: SLYNYRD fighting-stance, punch/kick and interior tutorials, plus the anime's official character-design page. No outside sprite sheets were copied. The town and game effects remain fictional.

Screenshots of all fourteen redrawn fighters and all eight furnished rooms were inspected locally. Automated browser tests do not establish a full human playthrough on the public GitHub Pages origin or every user's browser/device. Further art and balance refinement remains possible.

## Publication gate
This document-only commit changes none of the tested source. Fast-forward main only after checking its current head; verify the corresponding GitHub Pages build/deployment separately before saying the update is live. Expected playable route: https://scripterjames.github.io/gojo-vs-toji/adventure/ .
