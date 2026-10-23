# Curriculum partitions

Curriculum content in this repo is split into three partitions, each seeded on
its own: production, UI test, and standalone project. Which partition something
belongs to is decided by the name of the thing defined, not by where its file
happens to sit, and each partition's definition files live in its own tree.
`dashboard/test/ui/config/README.md` and
`dashboard/config/standalone_projects/README.md` cover how the two
non-production partitions are seeded and authored.

Part of the [partitioned curriculum data proposal](https://docs.google.com/document/d/1iiJXtPODakjuZ7-2yKJ941H56dcyUmUFtWa7zGgqKdw/edit?tab=t.0#heading=h.qx67631q1z2d).

| Partition | Identifier | Tree |
|---|---|---|
| Production | `:production` | `dashboard/config`, apart from `config/standalone_projects` |
| UI test | `:ui_test` | `dashboard/test/ui/config` |
| Standalone project | `:standalone_project` | `dashboard/config/standalone_projects` |

## Naming

- UI test: course offerings, courses and units named `ui-test-...`, e.g.
  `ui-test-csf`, and levels named `UI Test ...`, e.g. `UI Test K-1 Artist1 1`
  (`Level.ui_test_partition_name?`).
- Standalone project: levels only, in one of these forms
  (`Policies::StandaloneProjects.partition_name?`):
  - `New ... Project`, e.g. `New App Lab Project`, the standard format for
    a project level name
  - `Calc Free Play` or `Eval Free Play`
    (`Policies::StandaloneProjects::LEGACY_PROJECT_NAMES`): two project levels
    named before that rule;
  - `... Subproject`, e.g. `Dancer AI Subproject`: the form for a sublevel of a
    project level
- Production: everything else.

Level names are matched case-insensitively, and on the level name rather than
the filename, because the two differ: the DSL file defining `UI Test Foo` is
`ui_test_foo.multi`. The standalone project partition treats its forms alike.
A name may match only one partition rule: `UI Test Foo Subproject` is refused
everywhere a name is checked rather than assigned to either partition.
`Policies::LevelFiles.partition_for_name` returns a level name's partition.

A name rather than a level property, because the partition has to be decidable
from a bare string: the seed checks a unit's level references as serialized
keys, before the rows joining unit to level exist, and a definition file's path
is computed from a name without loading the file.

Because the name selects the partition, a production level and a standalone
level can never share a name, and a check that needs both trees in view is
never required. That is what lets CI and dev containers uphold the partition
boundaries without production content.

## Rules

The partitions are seeded independently, so a reference from one into another
is unresolvable wherever only one was loaded.

| Rule | What it does | Applies to |
|---|---|---|
| Misfiled file check, in `LevelLoader.import_levels` and `parse_dsl_files` (`dashboard/lib/tasks/seed.rake`) | Refuses to seed a `.level` or DSL file outside the tree its level name selects. The `.level` error prints the `git mv` that fixes each file. | all |
| `Level#name_matches_at_most_one_partition` | Refuses a level name that matches two partition rules. `Policies::LevelFiles.partition_for_name` raises on such a name, so seeds and level file writes stop too. | UI test, standalone project |
| `ParentLevelsChildLevel#validate_within_partition` | Refuses the row joining a level to a child (sublevel, contained level, project template) in another partition, and says how to copy the child into the parent's partition. | all |
| `LevelsWithinLevels#children_stay_within_partition` | The same rule by name, on a level's contained level and project template names, before the joining rows exist. Also catches names with no level yet. | all |
| `Level#name_change_stays_within_partition` | Refuses renaming a level into another partition while a unit or another level references it, since that would move its definition file to another tree or split it from its relatives. | all |
| `ScriptLevel#levels_stay_within_ui_test_partition`, also checked in `ScriptLevel#update_levels` | Lets a `ui-test-` unit use only `UI Test ` levels, and any other unit none. Deprecated blockly levels are exempt: they have no definition file in any tree, and the production and UI test seeds both load them from `config/deprecated_levels`. | production, UI test; units exist only there, and production units may also use standalone project levels |
| `Level#non_production_levels_are_immutable_on_levelbuilder` | In the levelbuilder web application, refuses creating, editing, renaming into or out of, or destroying a level in these partitions. Seeds run outside it, so a levelbuilder deploy still brings repo changes in. | UI test, standalone project |
| `tools/hooks/restrict_levelbuilder_changes.rb` | Keeps the levelbuilder content push from committing anything in these trees. | UI test, standalone project |
| `test/lib/policies/standalone_projects_test.rb` | Without production content, checks that every level `standalone_projects.yml` names has a standalone project name and exactly one definition file in the standalone project tree, and none in the UI test tree; that every file in the standalone project tree has a standalone project name; and that no file in either non-production tree matches two partition rules. | standalone project; the last check, UI test too |
| `test/integration/standalone_project_levels_test.rb` | Checks that every level `standalone_projects.yml` names is seeded, has a game, sets `is_project_level`, and opens at `/projects/<key>/new`. | standalone project |

`grep -r -e partition_name? -e same_partition? -e partition_for_ dashboard`
finds every enforcement point in the code.
