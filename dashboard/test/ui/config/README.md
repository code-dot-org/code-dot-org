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

A third tree, under `dashboard/config/standalone_projects`, holds the levels
behind `/projects/<key>` and is selected by its own name rules (`New ...
Project`, `... Subproject`); see the README there. A name may match only one
tree's rule.

A name prefix rather than a level property, because the partition has to be
decidable from a bare string: the seed checks a unit's level references as
serialized keys, before the rows joining unit to level exist, and a definition
file's path is computed from a name without loading the file.

## Invariants

The two trees are seeded independently, so a reference from one into the other
is unresolvable wherever only one tree was loaded. Three rules follow, each
enforced in the models:

- a unit and the levels it references must be on the same side. Deprecated
  blockly levels are exempt: they have no definition file in either tree, and
  both seeds load them from `config/deprecated_levels`.
- a parent level and its children — contained levels, project template levels,
  LevelGroup and BubbleChoice sublevels — must be on the same side.
- a level in use by a unit, or attached to another level as a parent or
  child, may not be renamed across the boundary, since that would move its
  definition file between the trees or split it from its relatives.

The second and third rules hold between all three partitions, the standalone
project tree included, by comparing the trees two names select
(`Policies::LevelFiles.same_tree?`). The first applies only here, since units
exist only in production and UI test.

`grep -r -e ui_test_name? -e same_tree? dashboard` finds every enforcement
point.

## Seeding

`rake seed:ui_test` seeds this tree, and is the default seed in the test
environment; see `UI_TEST_SEED_TASKS` in `dashboard/lib/tasks/seed.rake`. It
reads this tree in place of `config/levels`, `config/scripts` and
`config/course_offerings`, not in addition to them: the tasks
`child_dsls_ui_tests`, `custom_levels_ui_tests`, `parent_dsls_ui_tests` and
`course_offerings_ui_tests` replace their production counterparts rather than
following them.

So a test environment holds no production course offering, and of production
levels only the deprecated blockly levels above and the standalone project tree,
`config/standalone_projects`, which backs urls like
https://test-studio.code.org/projects/applab/ and is seeded in every
environment.

Development seeds both trees, since `DEFAULT_SEED_TASKS` there is the
production list followed by the UI test list.

## Cached units

A unit whose level pages should be publicly cacheable needs an entry in
`CACHED_UI_TEST_UNITS` in `lib/cdo/http_cache.rb`, alongside the production
`CACHED_UNITS`.

## Adding content

Developers author this content, working locally with `levelbuilder_mode`
enabled. For now, developers must manually give any new course, unit, or level
objects the name prefixes mentioned earlier, which will trigger the content to
be written into this tree rather than into dashboard/config.
