# Standalone projects

Standalone project levels are those behind `/projects/<key>`
(`/projects/applab`, `/projects/dance`, ...). `standalone_projects.yml` maps
each key to a level name, and `ProjectsController` looks the level up by that
name on every request, so these are part of the platform, not curriculum reached
through a unit. They are seeded by `rake seed:standalone_project_levels` in
every environment, as well as in the unit test database.

The layout matches the production and UI test trees: `.level` files under
`levels/custom/<game>/`, DSL files (a `BubbleChoice` project with sublevels)
under `scripts/`.

## Naming

A level is in this partition if its name, matched case-insensitively, has one
of these forms (`Policies::StandaloneProjects.partition_name?`):

- `New ... Project`, e.g. `New App Lab Project`, the standard format for
  a project level name
- `Calc Free Play` or `Eval Free Play`
  (`Policies::StandaloneProjects::LEGACY_PROJECT_NAMES`): two project levels
  named before that rule;
- `... Subproject`, e.g. `Dancer AI Subproject`: the form for a sublevel of a
  project level

The partition treats the forms alike. The name decides the partition, never
where the file happens to sit. A name may match only one partition rule:
`UI Test Foo Subproject` is refused everywhere a name is checked rather than
assigned to either partition.

Because the name selects the partition, a production level and a standalone
level can never share a name, and a check that needs both trees in view is
never required. That is what lets CI and dev containers uphold the partition
boundaries without production content.

## Rules

The partition rules are the same for every partition; see
`dashboard/test/ui/config/README.md`.

- A file must sit in the tree its level name selects. `seed:custom_levels` and
  the DSL seeds refuse a misfiled file and print the `git mv` that fixes it.
- A parent and its children must be in the same partition.
- A level used by a unit or attached to another level may not be renamed into
  another partition.

The levelbuilder web application cannot create, edit, rename or destroy any
level in this partition, whether or not the yml names it, as for UI test
levels. They change only in pull requests, and the seed brings those changes
to levelbuilder as to every other environment.
`tools/hooks/restrict_levelbuilder_changes.rb` also keeps the content push from
committing anything in this directory.

`test/lib/policies/standalone_projects_test.rb` checks the yml against this
tree without production content: every configured name is a standalone
partition name with exactly one file here; every file here has a standalone
partition name.

## Adding a project

Work locally with `levelbuilder_mode` on. Using a valid name puts the file in
the correct location on the first save.

1. Create the level as `New Foo Project`, and set `"is_project_level": true`
   in its file by hand (`standalone` in a BubbleChoice DSL); levelbuilder has
   no field for it. Without it a Lab2 page never receives its project channel.
2. For a multi-project lab, create each sublevel as `<Something> Subproject`
   before attaching it to the parent.
3. Add the `foo:` entry to `standalone_projects.yml`.
4. Run `bundle exec ruby -Itest test/lib/policies/standalone_projects_test.rb`
   from `dashboard/`
5. Test it out on localhost at `/projects/foo/new`
6. commit the level files with the yml.
