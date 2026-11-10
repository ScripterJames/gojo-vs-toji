# Branch integration status — November 9, 2026, approximately 5:37 PM Pacific

DO NOT fast-forward main to this branch without a fresh reconciliation.

Before publication, the expected-head check found that main had independently advanced from 13cfe96d536f7f3861e1d7a5d8368db5a7ec07c1 to 21ca0fa1119dc6fdab40dc572179800995f4e3d6. That newer release implements the same user-authorized scope: furnished eight-room layouts, fourteen improved grounded arena sprites, and unified interactions, with additional click-to-walk pathfinding, Q target cycling and improved outdoor tree collision geometry. Its code must not be overwritten by this alternative candidate.

The alternative candidate on this branch passed 512 assertions in run 42736214936, including 157 object activations and 490 grounded sprite frames. Those counts describe THIS BRANCH ONLY, not the published website.

The current published release at main 21ca0fa1119dc6fdab40dc572179800995f4e3d6 passed its own five-suite regression run 42735446809: 42 town, 84 arena, 21 native-origin integration, 19 shop and 34 new interaction/art assertions (200 total). It routes 154 objects and checks 462 grounded sprite frames. The GitHub Pages deployment run 42736099363 completed successfully. Its downloaded Pages artifact was inspected and its 34-check interaction suite independently rerun locally using the explicitly declared inline/Storage-fixture mode: PASS, 154 objects, no JS exceptions. The native-origin version passed in GitHub Actions; no full public-site manual browser playthrough is claimed.

Keep main's newer implementation as the user-facing release. This branch remains a tested alternative/reference only. Do not merge duplicate interaction systems or copy an older whole-file version over main. The user-facing controls on the published version are E to interact, click/tap to walk to a target, and Q to cycle nearby targets, not this branch's Tab/Next controls.
