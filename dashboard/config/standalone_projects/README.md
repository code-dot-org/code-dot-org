# Standalone projects

The levels behind `/projects/<key>` (`/projects/applab`, `/projects/dance`,
...) and their sublevels. `standalone_projects.yml`, here, maps each key to a
level name, and `ProjectsController` looks the level up by that name on every
request, so these are platform fixtures the code depends on, not curriculum
reached through a unit. They are seeded in every environment by
`rake seed:standalone_project_levels`, which runs as part of `seed:scripts` and
of `seed:test`, so the unit-test database has them too.

The layout matches the production and UI test trees: `.level` files under
`levels/custom/<game>/`, DSL files (a `BubbleChoice` project with sublevels)
under `scripts/`.

## Naming

A level is in this tree if its name, matched case-insensitively, has one of
these forms (`Policies::StandaloneProjects.tree_name?`):

- `New ... Project`, e.g. `New App Lab Project`: the form for a level the yml
  names;
- `Calc Free Play` or `Eval Free Play`
  (`Policies::StandaloneProjects::LEGACY_PROJECT_NAMES`): two project levels
  named before that rule;
- `... Subproject`, e.g. `Dancer AI Subproject`: the form for a child
  (sublevel, contained level, project template).

The partition treats the forms alike. The name decides the tree, never where
the file happens to sit. A name may match only one partition rule:
`UI Test Foo Subproject` is refused everywhere a name is checked rather than
assigned to either tree.

Because the name selects the tree, a production level and a standalone level
can never share a name, and a check that needs both trees in view is never
required. That is what lets CI and dev containers work without production
content.

## Rules

The partition rules are the same for every partition; see
`dashboard/test/ui/config/README.md`.

- A file must sit in the tree its level name selects. `seed:custom_levels` and
  the DSL seeds refuse a misfiled file and print the `git mv` that fixes it.
- A parent and its children must be in the same partition.
- A level used by a unit or attached to another level may not be renamed into
  another partition.

Levelbuilder treats these levels like production levels, within those rules;
the daily content push carries its writes to this tree.

One rule comes from the yml rather than the partition:

- A level named in `standalone_projects.yml` cannot be renamed or destroyed
  anywhere, since `/projects/<key>` finds it by that name. Remove or change
  the entry first.

`test/lib/policies/standalone_projects_test.rb` checks the yml against this
tree without production content: every configured name is a standalone tree
name with exactly one file here; every file here has a standalone tree name.

## Adding a project

Work locally with `levelbuilder_mode` on. The name puts the file in this tree
on the first save.

1. Create the level as `New Foo Project`.
2. For a multi-project lab, create each sublevel as `<Something> Subproject`
   before attaching it to the parent.
3. Add the `foo:` entry to `standalone_projects.yml`.
4. Run `bundle exec ruby -Itest test/lib/policies/standalone_projects_test.rb`
   from `dashboard/` and commit the level files with the yml.

## Recoveries

- Named it `Foo Project`, or anything off-pattern: the file went to
  `config/levels`. Rename the level in levelbuilder mode, which writes the
  file here, then delete the old file, which the rename leaves behind.
- Created the level, forgot the yml: `/projects/foo` has no route until the
  entry exists. Add it.
- Named it `UI Test Foo Subproject`: refused on save. Drop one of the markers.
  A UI test that needs a project-style level clones it as a `UI Test ` level
  reached through a `ui-test-` unit.
- Named a sublevel `Dancer AI` and tried to attach it: refused, since the child
  would be in the production partition. Rename it to `Dancer AI Subproject` and
  delete the old file under `config/levels`; the attach then succeeds.
- Registered a name with no level: the unit test fails on the missing file, and
  `test/integration/standalone_project_levels_test.rb` fails for that key.
  Create the level.
- A pattern-named file landed under `config/levels` by hand: any seed with
  production content mapped in stops as misfiled and prints the `git mv`.
- Retiring a lab: remove the yml entry, which releases the destroy guard, then
  destroy the level locally so its file goes. Units that referenced the level
  need their `script_json` rewritten before the next seed, as after any level
  rename or removal.
