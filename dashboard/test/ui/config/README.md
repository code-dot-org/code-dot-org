# UI test curriculum content

Curriculum content which exists only for the UI tests in
`dashboard/test/ui/features`. The layout mirrors `dashboard/config`.

The point of the partition is to keep production curriculum content — roughly
a gigabyte of files, on its way out of this repo entirely — away from
environments which only run tests. CI and dev containers seed this tree and
nothing else, which is what makes a short-lived container practical. A second
benefit runs the other way: test content is never seeded in production, so a
`ui-test-` course can be `stable` without appearing to users.

Part of the [partitioned curriculum data proposal](https://docs.google.com/document/d/1iiJXtPODakjuZ7-2yKJ941H56dcyUmUFtWa7zGgqKdw/edit?tab=t.0#heading=h.qx67631q1z2d).

## Naming

Which tree something belongs to is decided by the name of the thing defined,
not by where its file happens to sit:

- course offerings, courses, units: names beginning `ui-test-`, e.g.
  `ui-test-csf`
- levels: names beginning `UI Test `, matched case-insensitively, e.g.
  `UI Test K-1 Artist1 1`

Levels are matched on the level name rather than the filename because the two
differ: the DSL file defining `UI Test Foo` is `ui_test_foo.multi`.

A name prefix rather than a level property, because the partition has to be
decidable from a bare string: the seed checks a unit's level references as
serialized keys, before the rows joining unit to level exist, and a definition
file's path is computed from a name without loading the file.

## Invariants

The two trees are seeded independently, so a reference from one into the other
is unresolvable wherever only one tree was loaded. Three rules follow, each
enforced in the models:

- a `UI Test ` level may only be referenced by a `ui-test-` unit. The reverse
  is allowed: `ui-test-` units may still reference production levels, which is
  the state of anything not yet migrated.
- a parent level and its children — contained levels, project template levels,
  LevelGroup and BubbleChoice sublevels — must be on the same side, in both
  directions.
- a level in use by a unit, or attached to another level as a parent or
  child, may not be renamed across the boundary, since that would move its
  definition file between the trees or split it from its relatives.

`grep -r ui_test_name? dashboard` finds every enforcement point.

## Seeding

`rake seed:ui_test` seeds this tree, and is the default seed in the test
environment; see `UI_TEST_SEED_TASKS` in `dashboard/lib/tasks/seed.rake`. Its
level tasks (`custom_levels_ui_tests`, `child_dsls_ui_tests`,
`parent_dsls_ui_tests`) run after the production level tasks, so a
not-yet-migrated `ui-test-` unit can still resolve production levels.

## Cached units

A unit whose level pages should be publicly cacheable needs an entry in
`UI_TEST_CACHED_UNITS` in `lib/cdo/http_cache.rb`, alongside the production
`CACHED_UNITS`.

## Adding content

Developers author this content, working locally with `levelbuilder_mode`
enabled so that saving a level writes its definition file. Curriculum authors
do not: the levelbuilder environment refuses to save or destroy `UI Test `
levels (a `Level` validation and destroy guard), and under the proposal will
not have access to this tree at all. To move an existing unit's levels here,
see `bin/curriculum/clone_ui_test_levels.rb`.
