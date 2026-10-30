# UI test curriculum content

Curriculum content which exists only for the UI tests in
`dashboard/test/ui/features` and the playwright tests in
`frontend/packages/e2e-tests`. The layout mirrors `dashboard/config`. Its naming
and partition rules are in `dashboard/config/PARTITIONS.md`.

The point of the partition is to keep production curriculum content — roughly a
gigabyte of files — out of development and test environments. CI and dev
containers seed without production content, which is what makes a short-lived
container practical. A second benefit runs the other way: test content is never
seeded in production, so a `ui-test-` course can be `stable` without appearing
to users.

## Seeding

`rake seed:ui_test` seeds this tree, and is the default seed in the test
environment; see `UI_TEST_SEED_TASKS` in `dashboard/lib/tasks/seed.rake`. It
seeds UI test levels, needed by ui-test- units, and standalone project levels,
which back urls like https://test-studio.code.org/projects/applab/.

Seeding this tree omits production course offerings, courses, units, and levels,
with the exception of deprecated blockly levels and standalone project levels
which are seeded in every environment. Omitting production levels in particular
saves considerable seed time in test environments.

## Cached units

A unit whose level pages should be publicly cacheable needs an entry in
`CACHED_UI_TEST_UNITS` in `lib/cdo/http_cache.rb`, alongside the production
`CACHED_UNITS`.

## Adding content

Developers author this content, working locally with `levelbuilder_mode`
enabled. For now, developers must manually give any new course, unit, or level
objects the `ui-test-` or `UI Test ` name prefix, which will trigger the content
to be written into this tree rather than into dashboard/config.
