# Hakone Life expansion — implementation log

## User authorization and scope
James requested overnight development of the existing Gojo vs Toji browser game: more playable characters with unique abilities, saved upgrades, and a walkable Hakone-inspired town. His latest clarifications: EVERYTHING placed should be interactive, research actual vending-machine/convenience-store/local-shop items, and add town life as a SEPARATE GAME MODE. Do not replace the original game or remove existing features. Preserve main /index.html and /preview/; put the expansion in /adventure/. A game-mode selector should link arena and town, not force peaceful play into combat. The new layout is fictional and inspired by Hakone, not a geographic replica. Prices and item benefits are fictional game balancing, not real prices or medical claims. No paid services, purchases, gambling or accounts.

## Current verified baseline
Main commit before expansion: 5c6a4d0cbceabdd63d1c61f386d4e7ae452fcb03. Published /preview/ contains Gojo and Toji only, repaired melee hit windows, five-second nonlethal Blue, offensive/evasive Toji dash, 50 starter coins, 35 coins per CPU win, and per-character upgrades (Strength, Health, Speed, Special; three levels; 35/70/105 coin costs). Existing PNG atlases are preview/assets/gojo.png and toji.png (528x456, 6x6 cells, each 88x76). Do not claim Hakari is already live. Earlier waves_source_v2.md was a Library draft, not committed content.

## Work branch and safe publication
Branch: hakone-town-expansion, created from main. Read latest branch and main before every session. No force pushes; never overwrite other changes. Only publish tested additions in adventure/ and log updates. Add a navigation link to existing preview only as a minimal, explicit integration; keep combat unchanged. Confirm Pages deployment before describing a feature as live. Record actual tests, never invented browser tests.

## Priorities
1. Standalone Hakone Life: walking, collision, camera, E prompts, enter/leave buildings, town return from any fight, bag and local saves.
2. Research-informed products and actual interactions: drinks, meals, supplies, microwave, smoothie machine, coffee machine, recycling, NPC requests, benches, hot spring, dojo, signs, streetlights, trees, river/bridge inspection, inn, station map/fast travel, mailbox.
3. Upgrade UI and useful coin loop. Import old upgrade/coin values once into separate mode without changing old mode's saves. Clearly mark save unavailable if browser blocks storage.
4. Expand roster with genuinely distinct mechanics. Planned first roster: Gojo, Toji, Hakari, Sukuna, Megumi, Yuji, Nobara, Maki, Toge, Panda, Nanami, Yuta, Choso, Todo, Jogo, Mahito. These are fan-game adaptations, not claims of exact canonical move sets. No promise all are implemented until tested.
5. Art polish: consistent 16px tile vocabulary, selective texture, limited palette, restrained cast shadows, clean silhouettes, cached animation frames, whole-pixel placement and nearest-neighbor rendering. Reuse existing Gojo/Toji assets; do not present concept art as integrated sprites. New sprites may begin as draft art, which must be disclosed.

## Research checked November 8, 2026
These are references, not asset licenses. Learn techniques; do not copy paid/source artwork.
- Seven-Eleven Japan official English visitor page: https://www.sej.co.jp/in/en.html — tuna-mayo onigiri, egg salad sandwiches, Nanachiki, smoothies, Seven Cafe, oden; microwaves and ATM services. Availability varies.
- Seven-Eleven Japan product categories: https://www.sej.co.jp/products.html — onigiri, bento, noodles, sandwiches, bread, hot snacks, oden, steamed buns, cafe, frozen foods.
- Seven Cafe smoothie instructions: https://www.sej.co.jp/products/smoothie.html — buy frozen cup, scan, remove film, use dedicated blender. In-game process shortened for play; regional products not guaranteed at a real Hakone shop.
- Suntory official product information: https://www.suntory.com/sbf/business/index.html — BOSS coffee, Iyemon green tea, natural mineral water, oolong tea. https://www.suntory.co.jp/softdrink/jihanki/ — vending-machine business.
- Otsuka official Pocari Sweat product page: https://www.otsuka.co.jp/en/nutraceutical/products/pocarisweat/ — product identity only; gameplay energy effects are fictional.
- Hakone Navi shopping: https://www.hakonenavi.jp/international/en/interest/shopping — onsen manju and wood marquetry.
- Hakone Navi Kikukawa Shoten: https://www.hakonenavi.jp/international/en/spot/435 — castella-yaki Hakone manju. Use a fictional shop, not an assertion of a real store inventory.
- SLYNYRD Pixelblog 20: https://www.slynyrd.com/blog/2019/8/27/pixelblog-20-top-down-tiles — 16x16 tiles, limited colors, quiet areas, tile variants.
- SLYNYRD Pixelblog 21: https://www.slynyrd.com/blog/2019/9/18/pixelblog-21-top-down-objects — consistent projection and subtle separate shadows.
- SLYNYRD Pixelblog 35: https://www.slynyrd.com/blog/2021/11/30/pixelblog-35-top-down-interiors — interior furniture aligned to tile scale.
- SLYNYRD Pixelblog 43: https://www.slynyrd.com/blog/2023/3/26/pixelblog-43-top-down-tiles-part-2 — layered variants and simple water animation.
- SLYNYRD Pixelblog 55: https://www.slynyrd.com/blog/2025/3/24/pixelblog-55-top-down-character-animation — consistent anatomy and pivots, six-frame directional movement, compare animations in motion.

## Overnight execution
An hourly task is scheduled from about 11 PM November 8 through 7 AM November 9, America/Los_Angeles (9 bounded sessions, flexible timing). This is not continuous background execution. Read this log to avoid duplicate work. Run useful tests and save a short per-session changelog. Give an honest morning summary, link to published mode only when confirmed, and list remaining work. Tool access during future sessions may vary; report blockers rather than inventing progress.

## Session 0 — research and specification
Created branch, read baseline repository and animation implementation, researched primary product and art sources, documented latest separate-mode requirement. Implementation and browser tests still pending at this checkpoint.
