# Sprite library specification

`src/sprites/` is a p5 extension that gives a p5 instance sprites, groups,
animations, collisions, a camera and keyboard and mouse edge state: the
part of p5.play 1.x that Sprite Lab uses. It is exported on its own as
`@code-dot-org/sprite-lab/sprites` and runs over upstream p5.

It is written clean-room, so that it is Code.org's own code under this
repository's licence rather than a derivative of the LGPL-2.1 p5.play fork
(`@code-dot-org/p5.play` 1.3.21-cdo) that apps uses.

## The two sides

The specification side read the fork, apps' Apache-licensed wrappers of it
(`P5Wrapper.js`, `P5SpriteWrapper.js`, `P5GroupWrapper.js`) and apps' tests,
and wrote the documents here. They state behavior, not code: formulas in
prose or mathematics, observable state, and test vectors, most obtained by
running the fork under apps' test harness. They name only public API.

The implementation side works from these documents, apps' tests and
upstream p5. It does not read the fork, in `apps/node_modules` or anywhere
else, nor copies of it.

A requirement is cited by its identifier in the test that checks it, so
every behavior can be traced from specification to test to code.

## Documents

| File               | Prefix | Subject                                                     |
| ------------------ | ------ | ----------------------------------------------------------- |
| `overview.md`      | LIF-   | What the library adds to a p5 instance; the frame lifecycle |
| `sprite.md`        | SPR-   | Sprite state, the per-frame update, drawing a sprite        |
| `group.md`         | GRP-   | Groups and `allSprites`                                     |
| `world.md`         | WLD-   | `World`, `drawSprites`, edge sprites                        |
| `collision.md`     | COL-   | Colliders, collisions, the mouse hit test                   |
| `animation.md`     | ANI-   | Animations and sprite sheets                                |
| `camera.md`        | CAM-   | The camera                                                  |
| `input.md`         | INP-   | Keyboard and mouse state                                    |
| `compatibility.md` | CMP-   | Fork bugs kept on purpose, and departures from the fork     |

Each ends with test vectors, what it deliberately leaves unspecified, and
open questions. A behavior the fork has that Sprite Lab never reaches is
left out on purpose.
