# Strongest of History, onsen activities and next challengers

Requested by James, November 9, 2026. Base main:
`4e134b10f17e0ed7a8ecb2526b7b94d947ae6dce`.
Work branch: `hakone-strongest-onsen`. Original root and `preview/` are unchanged.

## Implemented in this candidate

**The Strongest of History** is a separate, deliberately overpowered seventeenth
character, not a replacement for Gojo or Sukuna. At base rank: 500 maximum HP,
35 punch damage, 55 kick damage; ordinary Gojo has 100/7/11. At matching upgrade
ranks HP and melee remain exactly five times Gojo. Movement is normal controllable
speed, not five times faster. His unique History's Judgment sends five crimson
slash pulses over five seconds, 25 base damage each: up to 125 total, compared
with Gojo's up-to-25 base Blue damage. Each Special rank adds 25 total Judgment
damage. Range/height and invulnerability can prevent hits. Judgment can finish
an opponent; Gojo's Blue remains nonlethal. There is no claim of five-times win
probability, complete matchup balance or canonical anime statistics.

The character is free in both arena selectors and the town's Character/C picker.
He has cached, original four-arm pixel sprites in both modes and full saved
upgrades. The long name fits the health HUD. Sukuna's forehead/cheek/chin markings
are clearer in both renderers. Some old town clothing palettes were aligned to
the already-existing arena art; no downloaded fan art is claimed in this pass.

**CPU next challenger:** enabled by default. A player victory awards the existing
35 coins exactly once, announces the next roster character, then starts a fresh
round after a two-second active-time break. Health is restored between rounds;
old projectiles and specials are cleared. The sequence skips the player's chosen
character and wraps after the roster. Uncheck Next challenger to stop automatic
progression; restart resets the round counter. PvP and player losses do not
advance or award CPU coins. Leaving the arena unloads the pending round. Mode and
player selection are captured at Start, not silently altered mid-round. The
upgrade shop/hidden tab pauses the transition and active wall-clock specials.
A defeated opponent no longer gets a second update to attack after being knocked
out earlier in the same frame.

**Onsen:** the pool used to be an instant menu-based +100 energy reward, without
actually entering water. Now the user can rinse at a real reachable wash station
for two seconds (free), then enter the pool. The character visibly soaks with
head/shoulders above water and restores energy gradually. Entry retains 15 coins,
or 8 with an owned towel; fees are charged once at entry, not during soaking or
on exit. E, Escape, a movement key, the Step out button and appropriate pointer
interaction restore a safe shore position. Mid-bath saves store the shore, never
the blocked water. Changing modes, leaving the building and reloading are safe.
Attendants and bathing stools guide the user to the actual stations; cubbies
still open the bag. Washing status resets on a new visit/reload. Bath artwork
uses opaque water and no nudity. All these are fictional game effects/prices.

**Ramen and soba only:** original warm timber/shoji/lantern treatments, tabletop
bowls, noodle icons and steam. Existing furniture still serves the same menus
and bag actions. 7-Eleven is explicitly excluded. A before/after full-render hash
test confirmed its floor and furniture remain pixel-for-pixel identical.

## Research inspected
- Studio Ghibli official Spirited Away reference page:
  https://www.ghibli.jp/works/chihiro/
- Hakone Tourist Association onsen sequence (wash before soaking; towel outside):
  https://hakone-japan.com/things-to-do/onsen/all/how-to-enjoy-onsen/
- Earlier pixel-art technique sources remain in the existing town/grounding logs.
No official soundtrack, ripped audio or downloaded character pack was added.
The user separately requested actual pixel-art search/candidates for all sixteen
original characters; the scheduled research pass owns that still-pending work.
Do not describe this original sprite update as imported Google artwork.

## Local execution and limits
Real local Chromium passed existing town/arena/traveler/interaction source suites,
33 new strongest/ladder assertions, 26 onsen activity assertions and 8 food-art
assertions. The onsen suite drives actual keyboard, pointer, route planning and
activity timing; only initial saved position/coins are seeded. Screenshots of
soaking, the boss/Sukuna arena and restaurants were visually inspected.
Local browser HTTP navigation is blocked by environment policy; local runs used
explicit set_content/Storage doubles. Strongest tests also use an explicit
manual clock to verify exact damage/windows. These are not manual full matches
or public-origin playthroughs. Native localhost/real iframe suites must pass in
GitHub Actions before publication. Never claim deployed from this draft alone.

## Transport and publication
To avoid retranscribing large complete source files, the exact reviewed diff is
transported as a hash-checked compressed patch on this branch. A temporary,
branch-only candidate workflow applies it, runs all nine actual Chromium suites,
and commits the tested readable source back to this branch with a normal
fast-forward push. It never writes main. The transient workflow and transport
blob remove themselves in that candidate commit. Main publication still requires
an explicit checked-head operation and successful Pages deployment verification.
The permanent regression workflow remains read-only and adds the three new suites.


## Complete candidate CI verification — PASS

GitHub Actions run 42756317299 on transport commit cd4250452bac056161e99794330868cc4f50bf55.
All nine suites executed successfully after validating every base and final source blob.
- test_hakone.py: 42 passing assertions.
- test_hakone_arena.py: 85 passing assertions.
- test_hakone_origin.py: 21 passing assertions.
- test_hakone_shop_art.py: 19 passing assertions.
- test_hakone_interactions.py: 41 passing assertions.
- test_hakone_travelers.py: 41 passing assertions.
- test_hakone_strongest.py: 33 passing assertions.
- test_hakone_onsen.py: 27 passing assertions.
- test_hakone_food_art.py: 10 passing assertions.
Total: 319 assertions.
The origin, shop, interactions, travelers and onsen suites ran on actual localhost HTTP with native storage and real iframes. Other suites declare source-loaded or clock/Storage fixtures. These are automated tests, not full human matches or a public-site playthrough. Publication and Pages success must still be verified separately.
The first candidate caught a real food-layer cache integration defect: three replacement icons bypassed the shared cache. The renderer now registers its three cached images in the shared icon bank, preserving the original 28-icon assertion and adding two cache regression checks.
