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

Their naming and partition rules are in `dashboard/config/PARTITIONS.md`.

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
