# Grounded fighters, furnished interiors and interaction audit

## Scope — November 9, 2026
James asked for better artwork for the newer fighters, no floating feet, real
7-Eleven aisles, restaurant seating and appropriate furniture in the other
interiors. He also asked to fix interactions with everything, aiming for an
8:45 PM America/Los_Angeles release. Work starts from published main
13cfe96d536f7f3861e1d7a5d8368db5a7ec07c1 on branch
`grounded-fighters-lived-in-shops`.

## Implemented changes
- All eight interiors now have individual layouts, not merely different floors.
  7-Eleven has three walk-between stocked aisles, refrigerated drinks, a hot-food
  case, checkout, preparation machines and recycling. Ramen and soba have ordering
  counters, stools, two dining tables, benches, kitchen/condiment details and tea.
  The gift shop has display islands; dojo has gear, benches and a practice mat;
  onsen has cubbies, wash station, stools and changing bench; inn has reception,
  futons, cushions and a tea table; station has waiting benches, kiosk and lockers.
- Every placed object remains interactive. Stocked furniture opens its actual
  stock; seating offers rest/food and a visible sitting pose; counters route to
  the appropriate staff/menu; tea/washing have modest free game benefits;
  furnishings such as the staff-only door and alcove are clearly inspections.
  The staff door is not falsely presented as an enterable room.
- Keyboard E, pointer clicks and the visible Interact button use one reach rule:
  nearest usable edge, 42px range, facing preference and blocked reach through
  intervening solid furniture. Building entry stays front-door-only. Highlighted
  targets match the prompt. Tab / Next cycles crowded targets. Closing a panel
  restores game focus; moving stands up. Clicking a far object explains that
  the player needs to approach it rather than silently doing nothing.
- Existing saved positions covered by new furniture relocate to nearby free
  space in the same room, keeping inventory and progression. Ingredient-to-meal
  transformations recheck output capacity before consuming the input. Clicking
  Arena while already in that mode no longer resets the active fight.
- Rebuilt the 14 newer arena fighters as original cached 112x90 raster frames,
  drawn at integer 2x scale: individual hair/outfits/equipment, tapered articulated
  limbs, controlled shading and outlined silhouettes. Gojo/Toji original PNG
  atlases are unchanged. There are 36 frames per new fighter (504 total).
- Fixed the old loop-clamping order that froze idle/walk on the last pose. Long
  buffs/companions no longer hold a perpetual casting pose. Feet are anchored
  using the actual opaque pixel baseline of each frame, not transparent canvas
  padding. Idle bob is absorbed by the knees; shadows stay at the physical floor.
  Airborne frames retain an intentional tuck/height offset.

## Preservation
No root index.html, /preview/ file, roster mechanics, special damage/cooldowns,
upgrade prices, existing rewards or save-key names were changed. All sixteen
fighters and their unique abilities remain. Meals affect town needs, not combat
stats. New inventory shelves reuse existing products and prices. No accounts,
telemetry, purchases, paid assets or real-money systems were added.

## Research / original artwork
- SLYNYRD Pixelblog 52, Idle Fighting Stance:
  https://www.slynyrd.com/blog/2024/9/26/pixelblog-52-idle-fighting-stance
- SLYNYRD Pixelblog 53, Punches and Kicks:
  https://www.slynyrd.com/blog/2024/11/25/pixelblog-53-punches-and-kicks
- SLYNYRD Pixelblog 35, Top Down Interiors:
  https://www.slynyrd.com/blog/2021/11/30/pixelblog-35-top-down-interiors
- Official anime character design reference: https://jujutsukaisen.jp/character/
Use these as references for anatomy, silhouette, staging, planted feet and room
scale. No third-party sprite sheets or tutorial images were copied. Original
code draws and caches the integrated pixel art. References also appear in the
in-game credits. This is an unofficial fan game and fictional town.

## Tests actually run locally before uploading
- 42 existing town Chromium checks: PASS.
- 84 existing arena Chromium checks: PASS.
- 346 new furnishing/grounding checks: PASS, including 157 placed objects
  activated using actual keyboard E from BFS-verified accessible positions,
  all outdoor/indoor reachability, range/occlusion, aisle side access, pointer
  selection, Tab and button cycling, focus return, seated rest/standing up,
  save-position migration, 504 non-clipped frames, all 490 grounded frames
  meeting the exact floor, and repeating walk/idle animation.
These local checks use actual Chromium with page.set_content, inlined candidate
scripts and an explicit Storage fixture. Some positions/timing are seeded for
repeatable tests. This is NOT 157 human walks or a public-site playthrough.
- Visually inspected the rendered 14-fighter contact sheet and all eight rooms.
- Node syntax checks passed. Existing native-origin tests could not run locally
  because browser navigation is blocked by environment policy; do not bypass it.

## Publication gate
Run the full GitHub Actions suite on this branch before publication, including
the existing 21 native-localhost-origin checks and 19 shop-art checks. Record
actual outcome below. Keep public GitHub Pages deployment verification separate
from source and localhost tests. Do not call a branch-only feature live.

## Remaining quality limits
This is a substantial original sprite/layout pass, not final professional art or
proof that every natural match is balanced. Town walking sprites remain the
existing original traveler art, with an added seated pose; the large redraw is
for arena fighters. Test fixtures are not a substitute for a human playthrough
on the user's actual device. Preserve saves and all interactions in later work.
