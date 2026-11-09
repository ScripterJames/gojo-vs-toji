# Hakone shop-art follow-through — November 9, 2026

The user's follow-up authorized completing the previously requested game. Before
editing, read main and hakone-town-expansion at 00a5730b993fc52d300169b008075f45fbcd6120,
plus both development logs. The core expansion already contains sixteen playable
fighters, unique specials, shared upgrades, separate town/arena modes, eight
interiors and all existing interaction loops. Do not describe these as newly
invented or confuse them with the original two-character /preview/.

## Additive changes in this pass
- `adventure/shop_art.js` wraps only the existing rendering functions. It cannot
  read or write localStorage and does not modify inventory, collision rectangles,
  coin prices, abilities, selected fighters or interaction handlers.
- Eight cached interior treatments: pale convenience-store tiles, station tiles,
  hot-spring stone, inn/dojo tatami, and distinct timber tones for the restaurants
  and gift shop. Existing walls and doors remain, and no unusable decorative
  furniture is added.
- Twenty-eight original, individually differentiated product/item icons. Shelves
  show their actual stock; prepared meals and cups differ from unprepared items.
- Vending-machine hot/cold labels, visibly distinct microwave, smoothie blender,
  cafe brewer and fictional coin bank. Label lettering is an original 3x5 pixel
  font, not downloaded font data. Existing E interactions remain unchanged.
- Town HTML loads the layer after art.js and before town.js and shows preview 0.4.
- `tests/test_hakone_shop_art.py` runs the real site in Chromium at a localhost
  HTTP origin with native storage and a real arena iframe. It checks caches,
  distinct icons, unchanged object/state data, original purchase prices, all
  three preparation machines, reload persistence, sixteen fighter selectors,
  leave-fight behavior, mobile overflow and script/image failures.
- Existing Chromium workflow now runs this new suite as well. Its older
  page.set_content town suite still injects the original scripts only; the new
  layer is tested by the native-origin suites, not by claiming those older
  mocked-storage checks cover it.

## Tests executed before committing the candidate
Node parsed shop_art.js successfully. Real local Chromium rendered the actual
new layer using explicitly stubbed legacy art/data: eight floor caches, all
28 nonempty and different item icons, no object mutation, and no JS errors.
The screenshot was visually inspected at reduced overview size. This was an
isolated art test, not full game or public-origin validation.

The new native-origin suite was Python-syntax checked locally. Complete
repository integration was subsequently verified by the branch workflow below.

## Complete repository Chromium verification — PASS
GitHub Actions run 42644945688 on exact source commit
`49e24748f0054027b256d4b7d0a1efe2c614c24f` completed successfully:
https://github.com/ScripterJames/gojo-vs-toji/actions/runs/42644945688

Job 129255574159 logs confirm four passing suites:
- 42 town checks, with page.set_content and an explicit storage test double.
- 84 arena checks, with page.set_content, explicit storage substitute and a
  deterministic combat clock, including all sixteen CPU special activations.
- 21 native-localhost-origin integration checks, with real storage, PNG loading,
  actual arena iframe, upgrade/coin synchronization, reload and leave-fight paths.
- 19 new native-localhost-origin shop-art checks, including eight unique cached
  floors, 28 distinct nonempty icons, unchanged geometry/state, buying and
  preparing smoothies/bento/coffee, exact original prices, persistent prepared
  items after reload, no duplicate starter gift, sixteen fighter selectors,
  returning from the arena to the same shop, no abandon reward, mobile layout,
  and no JavaScript exceptions or failed local script/sprite requests.

There are 166 passing assertions across these four suites. They are not 166
human playthroughs. Direct enter/interact helpers position some fixtures;
CPU-reward testing reduces the opponent's HP before a real keyboard punch.
These tests do NOT establish public GitHub Pages-origin browser behavior or
fairness in full natural matches. Deployment must be checked separately.
This documentation-only follow-up changes none of the tested source files.

## Research
- Original author, SLYNYRD Pixelblog 35, Top Down Interiors:
  https://www.slynyrd.com/blog/2021/11/30/pixelblog-35-top-down-interiors
  (16x16 tile vocabulary, matching furniture scale, restrained materials).
- SLYNYRD tutorial catalogue:
  https://www.slynyrd.com/pixelblog-catalogue
- Seven-Eleven Japan official visitor product/services page:
  https://www.sej.co.jp/in/en
  (food, cup preparation and machine references, not a guarantee of real stock).
The earlier source list remains in the in-game Research & credits dialog.
No tutorial art, paid assets, copied images or third-party font files were used.
Prices/effects remain fictional game values.

## Unchanged scope and remaining quality work
Root index.html, all /preview/ files, fighter combat and town saving are unchanged.
Sixteen fighters are implemented, but complete human-match balance and a public
GitHub Pages browser playthrough are not established by these art tests.
Further animation and environment polish can continue without erasing saves.
