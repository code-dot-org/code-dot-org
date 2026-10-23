# Curriculum partitions

Curriculum content in this repo is split into three partitions, each seeded on
its own: production, UI test, and standalone project. Which partition something
belongs to is decided by its name, and each partition's
definition files live in its own tree.
`dashboard/test/ui/config/README.md` and
`dashboard/config/standalone_projects/README.md` cover how the two
non-production partitions are seeded and authored.

The purpose of these partitions is:
- allow dev/test environments to operate without production curriculum content,
  which is large on disk and slow to seed
- make sure that standalone project levels, which support urls like
  /projects/applab, are present in all environments.

A name may match only one partition rule. Because the name selects the
partition, a check that needs all trees in view is never required. This allows
CI and dev containers uphold the partition boundaries without production
content.

See [partitioned curriculum data proposal](https://docs.google.com/document/d/1iiJXtPODakjuZ7-2yKJ941H56dcyUmUFtWa7zGgqKdw/edit?tab=t.0#heading=h.qx67631q1z2d) for more context.

| Partition | Identifier | Tree |
|---|---|---|
| Production | `:production` | `dashboard/config`, apart from `config/standalone_projects` |
| UI test | `:ui_test` | `dashboard/test/ui/config` |
| Standalone project | `:standalone_project` | `dashboard/config/standalone_projects` |

## Naming

- UI test: course offerings, courses and units named `ui-test-...`, e.g.
  `ui-test-csf`, and levels named `UI Test ...`, e.g. `UI Test K-1 Artist1 1`.
- Standalone project: levels only, in one of these forms:
  - `New ... Project`, e.g. `New App Lab Project`, the standard form for
    a project level name
  - `Calc Free Play` or `Eval Free Play`: two legacy project levels
  - `... Subproject`, e.g. `Dancer AI Subproject`: the form for a sublevel of a
    project level
- Production: everything else.

Levels name patterns are matched case-insensitively.

## Rules

The partition boundaries are enforced as follows:
- each curriculum object belongs to only one partition
- the partition of a curriculum object's name must match the partition
  of the tree its file sits in
- a parent level and its child levels must be in the same partition
- a unit and its levels must be in the same partition
- only production content can be modified on levelbuilder

For implementation of these rules, see:
- validations on `Level`, `ScriptLevel`, `LevelsWithinLevels`, and
`ParentLevelsChildLevel`
- seed logic in `seed.rake` and `level_loader.rb`
