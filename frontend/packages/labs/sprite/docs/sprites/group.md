# Groups

A group is an ordered collection of sprites. It is a JavaScript array
with extra methods, and the runtime depends on it being one. Every sprite
made by `createSprite` belongs to the group `allSprites`, which the frame
updates (LIF-11) and `drawSprites()` draws (WLD-9). A sprite also knows
the groups it belongs to, so removing a sprite takes it out of all of
them.

Group collision methods (`overlap`, `isTouching`, `collide`, `displace`,
`bounce`, `bounceOff`) are COL-. Drawing a group is WLD-9..WLD-13.

## The group object

GRP-1. `new p.Group()`, where p is the instance, returns a new empty
group. A group is an `Array`: `Array.isArray(g)` is true and `g instanceof
Array` is true. COL- relies on the `instanceof Array` test to tell a group
from a sprite, and the runtime uses `length`, `forEach`, `map` and
`filter` on groups.

GRP-2. `p.createGroup()` returns `new p.Group()`. `createEdgeSprites`
uses it (WLD-17).

GRP-3. Array element order is the group's order. Every method below that
adds, removes or sorts changes the array itself.

## Methods

GRP-4. `get(i)` returns element i (undefined out of range). `size()`
returns `length`. `contains(s)` is true if `indexOf(s)` is not −1.
`indexOf(s)` returns the index of the first element identical to s, or
−1. `toArray()` returns a new plain array with the same elements in the
same order.

GRP-5. `add(s)`:

- If s is not a sprite, throws an `Error` whose message is `you can only
add sprites to a group`, which converts to the string the fork throws
  (`Error: you can only add sprites to a group`).
- If s is already an element, does nothing.
- Otherwise appends s, and appends the group to s's `groups` list.

GRP-6. `remove(s)`:

- If s is not a sprite, throws an `Error` whose message is `you can only
remove sprites from a group`, as in GRP-5.
- Removes every element identical to s. If any was removed, removes every
  occurrence of this group from s's `groups` list.
- Returns true if any element was removed, else false.
- Does not change s's `removed` flag; s is not destroyed.

GRP-7. `removeSprites()` calls `remove()` (SPR-36) on the first element
until the group is empty. Each element is therefore marked removed and
taken out of every group it was in, `allSprites` included.

Example: sprite c is in groups g and h; `g.removeSprites()`: c is
removed, g is empty, h is empty, and c is not in `allSprites`. (Run on
the fork.)

GRP-8. `clear()` empties the array and does nothing else. The sprites'
`groups` lists still name the group (CMP-10). A later `remove()` of such a
sprite calls the group's `remove`, which finds nothing and returns false;
no error results. This departs from the fork, where that removal never
returns: the stale entry is never taken off the sprite's list, so the
removal loops forever (CMP-41).

Example: a in g; `g.clear()`: `g.size()` 0, `a.groups.length` still 2.
(Run on the fork.)

GRP-9. `maxDepth()` returns the largest `depth` among the elements, or 0
for an empty group. `minDepth()` returns the smallest, or 99999 for an
empty group. A NaN depth among the elements makes the result NaN.

## allSprites

GRP-10. `allSprites` is a group belonging to the instance. Every read
returns the same object. `World.allSprites` is the same object (WLD-5).
`createSprite` adds each new sprite to it (SPR-1), so its first entry in
`sprite.groups` is `allSprites`.

GRP-11. `allSprites` holds exactly the sprites that are created and not
removed, unless the program called `allSprites.remove(s)` or
`allSprites.clear()` (SPR-38); the runtime never does.

GRP-12. `allSprites` starts in creation order. `drawSprites()` sorts it
by depth, in place, every time it is called with no argument (WLD-11), so
between frames in Sprite Lab its order is ascending depth, ties in
creation order, with sprites created since the last draw at the end.
This order is the update order of the next frame (LIF-12).

GRP-13. The runtime reads `allSprites.length` (performance counters),
iterates it with `forEach` (`P5Wrapper.debugSprites`,
`drawDebugSpriteColliders`), and calls `allSprites.removeSprites()`
(preview and `SpriteLab2Engine` rerun, LIF-19). It does not use
`allSprites` to find sprites by id, name, costume or label: it keeps its
own map from id to sprite and iterates that in ascending id order.

## Removal and iteration

GRP-14. A sprite's removal (SPR-36) visits its groups in the order it
joined them, calling each group's `remove`. Removal while a group is
being iterated shifts the later elements down by one: an index loop that
reads the size each time skips the element after a removed one (LIF-11).
`removeSprites` avoids this by always removing element 0.

## Labels are not groups

GRP-15. The runtime's `sprite.group` is a string label (SPR-35), not a
Group, and has no relation to the Group class or to `sprite.groups`.
The runtime selects sprites by label by filtering its own sprite map;
`''` selects sprites whose label is unset. The library must not define
`group` on sprites (SPR-6).

## Apps' group wrapper

GRP-16. `P5GroupWrapper` is not installed in Sprite Lab, for the same
reason as SPR-59. When installed (Game Lab), it only replaces the
group's collision methods with versions that step through the group
across interpreter ticks; group membership, order and drawing are
unchanged. It has no effect on this library.

## Test vectors

| #   | Setup                                                                      | Expected                                                                                                       | Source      |
| --- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------- |
| G1  | `g = createGroup()`; sprites a, b; `g.add(a)`, `g.add(a)`, `g.add(b)`      | size 2, length 2, `a.groups.length` 2, `g.get(0) === a`, `g.contains(b)`, `g.indexOf(b)` 1, `Array.isArray(g)` | run on fork |
| G2  | `g.add({})`                                                                | throws `Error: you can only add sprites to a group`                                                            | run on fork |
| G3  | `g.remove({})`                                                             | throws `Error: you can only remove sprites from a group`                                                       | run on fork |
| G4  | G1 then `g.remove(a)`, `g.remove(a)`                                       | true, false; size 1; `a.groups.length` 1; a still in `allSprites`; `a.removed` false                           | run on fork |
| G5  | a, b in g; `g.clear()`                                                     | size 0; `a.groups.length` 2, `b.groups.length` 2                                                               | run on fork |
| G6  | a, b in g; `b.remove()`                                                    | g size 1; b not in `allSprites`; `b.groups.length` 0                                                           | run on fork |
| G7  | a, c in g; c also in h; `g.removeSprites()`                                | g size 0, a and c removed, h size 0, `allSprites.size()` 0                                                     | run on fork |
| G8  | empty group                                                                | `maxDepth()` 0, `minDepth()` 99999, `size()` 0                                                                 | run on fork |
| G9  | a (depth 5), b (2), c (2), created in that order; `drawSprites()`          | `allSprites` order b, c, a                                                                                     | run on fork |
| G10 | G9 then b.depth 1, c.depth 1; `drawSprites()`                              | order b, c, a (tie keeps order)                                                                                | run on fork |
| G11 | g = [a (5), c (1)] after G10; read g; `drawSprites(g)`; read g             | a, c; then c, a                                                                                                | run on fork |
| G12 | `allSprites === World.allSprites`; new sprite's `groups[0] === allSprites` | both true                                                                                                      | run on fork |
| G13 | `toArray()`                                                                | a different array with the same elements                                                                       | run on fork |

## Not specified

- `setPropertyEach`, `callMethodEach`, and the `…Each` helpers built on
  them (`destroyEach`, `setVelocityXEach`, and the rest).
- `indexOf`'s use of an element's `equals` method when it has one;
  sprites have none, so identity is what matters.
- Group collision methods and their callbacks (COL-).

## Open questions

1. Resolved: GRP-5, GRP-6 and WLD-10 throw an `Error` whose message is
   the fork's string without its `Error: ` prefix, so it converts to the
   same string. The fork throws the string itself.
2. GRP-8: `clear()` leaves stale back-references. Unreachable from
   Sprite Lab; kept because it is cheap and apps' group tests may
   exercise it.
