# Strongest of History, usable onsen and next challengers

Requested by James, November 9, 2026. Base main:
`4e134b10f17e0ed7a8ecb2526b7b94d947ae6dce`.
Work branch: `hakone-strongest-onsen`. Original root and `preview/` unchanged.

## Implemented and verified

**The Strongest of History** is a separate, deliberately overpowered seventeenth
character, not a replacement for Gojo or Sukuna. At base rank: 500 maximum HP,
35 punch damage and 55 kick damage; ordinary Gojo has 100/7/11. At matching upgrade
ranks HP and melee remain exactly five times Gojo. Movement is normal controllable
speed, not five times faster. His unique History's Judgment sends five crimson
slash pulses over five seconds, 25 base damage each: up to 125 total, compared
with Gojo's up-to-25 base Blue damage. Each Special rank adds 25 total Judgment
damage. Range, height and invulnerability can prevent hits. Judgment can finish
an opponent; Gojo's Blue remains nonlethal. These are game statistics, not a claim
of five-times win probability, complete matchup balance or canonical anime stats.

The character is free in both arena selectors and the town's Character/C picker.
He has cached original four-arm pixel sprites in both modes and saved upgrades.
His long name fits the health HUD. Sukuna's forehead, cheek and chin markings
are clearer in both renderers. Some town clothing palettes were aligned to the
existing arena artwork. No downloaded character art is claimed in this pass.

**CPU next challenger:** enabled by default. Each player victory awards the
existing 35 coins once, announces the next roster character, then starts a fresh
round after a two-second active-time break. Health is restored between rounds;
old projectiles and specials are cleared. The sequence skips the player's chosen
character and wraps after the roster. Uncheck Next challenger to stop automatic
progression; restarting resets the round counter. PvP and player losses do not
advance or award CPU-win coins. Leaving the arena unloads the pending round.
Mode and player selection are captured at Start. The upgrade shop and hidden tab
pause the transition and active timed specials. A defeated opponent no longer
gets a second update to attack after an earlier knockout in the same frame.

**Onsen:** the old pool instantly gave energy through a menu without entering
water. Now a reachable washing station runs a visible two-second rinse, free,
then the player can enter the pool. Their head and shoulders remain above water
while energy restores gradually. Admission is still 15 coins, or 8 with an owned
towel, charged once on entry. E, Escape, a movement key, Step out and appropriate
pointer interaction return to a safe shore. Mid-bath saves store the shore, not
the blocked water. Switching modes, leaving and reloading do not trap the player.
Attendants/stools guide the player to real wash stations; cubbies open the bag.
Washing status resets on a new visit or reload. Bath art uses opaque water with
no nudity. All prices and restoration effects are fictional game values.

**Ramen and soba only:** warm original timber, shoji, lantern treatments, tabletop
bowls, noodle icons and steam. Existing furniture retains its menu/bag actions.
7-Eleven is explicitly excluded. A before/after render hash test confirms its
floor and furniture remain pixel-for-pixel unchanged by the restaurant layer.

## Actual research and unfinished asset requests
- Studio Ghibli official Spirited Away still gallery, visual atmosphere reference:
  https://www.ghibli.jp/works/chihiro/
- Hakone Tourist Association, wash-before-soaking sequence:
  https://hakone-japan.com/things-to-do/onsen/all/how-to-enjoy-onsen/
- Original pixel-art technique sources remain in the town and grounding logs.
- `docs/HAKONE_PIXEL_REFERENCE_RESEARCH.md` records the parallel research-only
  pass for all sixteen original roster names. Its results were searched with
  available web/image search; a direct Google attempt failed. They are reference
  candidates, not imported art. That document's baseline timing is historical.

The official requested JJK soundtrack and an imported, individually selected
pixel-art replacement for every original character are NOT included. Do not call
these requests complete or describe original code-rendered sprites as borrowed
Google artwork. No paid art, music or services were purchased.

## Tests and exact evidence — all nine suites passed

Candidate workflow run `42756317299`, job `129631421856`, completed successfully
on November 9 at 8:33 PM Pacific. It validated every base/final source blob,
applied the reviewed changes and ran the actual browser suites, then committed
tested readable runtime to `204248574bc6ea405c0b01954c2f19ef5d9e446d`.
https://github.com/ScripterJames/gojo-vs-toji/actions/runs/42756317299

- test_hakone.py: 42 assertions.
- test_hakone_arena.py: 85 assertions.
- test_hakone_origin.py: 21 assertions.
- test_hakone_shop_art.py: 19 assertions.
- test_hakone_interactions.py: 41 assertions.
- test_hakone_travelers.py: 41 assertions.
- test_hakone_strongest.py: 33 assertions.
- test_hakone_onsen.py: 27 assertions.
- test_hakone_food_art.py: 10 assertions.

Total: **319 passing automated assertions**, not 319 human playthroughs.
Origin, shop, interaction, traveler and onsen suites used real localhost HTTP,
native localStorage and real iframes. Other suites declare source-loaded,
controlled-clock or Storage fixtures. The onsen suite uses actual keyboard,
pointer, routes and activity timing with only the initial save/coins seeded.
Strongest tests verify actual keyboard damage and exact pulse timing, upgrades,
KO rewards, successor selection, wrapping, loss/PvP stop, pause and foot anchors.
Source screenshots of the new fighter, soaking and both restaurants were inspected.
Local HTTP navigation was blocked by this runtime, so native-origin integration
was performed in GitHub Actions rather than claimed from the inline local runs.
These tests do not prove perfect human-match balance or all real browsers/devices.
No full manual public-GitHub-Pages playthrough is claimed.

The first candidate run `42755564709` failed the existing icon-cache assertion:
three new noodle icons bypassed the shared cache. The correction registers all
three in the shared icon bank, preserving the original 28-icon uniqueness/cache
check and adding two new caching checks. No failing assertion was removed.

## Publication procedure and cleanup
The temporary candidate-only workflow never wrote main. The connector cleanup
commit removes that workflow and all five transport files, restores the permanent
read-only regression workflow with the nine suites, and includes the separate
reference document. Tested runtime/test bytes are unchanged by cleanup.
Main must be advanced only with a fresh expected-head check and no force push.
Verify GitHub Pages separately before telling the user the new version is live.
Read fresh main and this log for future edits; do not rebuild completed features.
