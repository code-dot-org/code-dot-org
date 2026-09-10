---
title: Levelbuilder environment
description: How the Levelbuilder authoring tool is gated, which environments enable it, and how to run it locally.
type: concept
---

**Applies to:** curriculum authors, engineers.

Levelbuilder is the internal tool curriculum authors use to create and edit
courses, units, lessons, and levels. It is not a separate application; it is
the same Rails app (dashboard) running with an extra configuration flag that
unlocks the authoring UI.

Levelbuilder is never reachable on production.

## Access gate

Two conditions must both be true for a user to reach any Levelbuilder editor:

1. The user holds the **LEVELBUILDER** `UserPermission`. Only teacher-type
   accounts can hold permissions; student accounts cannot.
2. The Rails process is running with `Rails.application.config.levelbuilder_mode`
   set to `true`.

When both conditions are met, CanCanCan grants `can :manage` over the full set
of curriculum models: `Level`, `Lesson`, `Unit`, `UnitGroup`,
`CourseOffering`, `Resource`, `Vocabulary`, `ProgrammingEnvironment`,
`ProgrammingExpression`, `ReferenceGuide`, `DataDoc`, `Rubric`,
`QuizQuestion`, `Block`, `SharedBlocklyFunction`, `Library`, `Video`,
`JSONVideo`, and others.

If either condition is missing, the controllers raise
`CanCan::AccessDenied` with the message "Cannot create or modify levels
from this environment."

A third, smaller guard: all Levelbuilder editing requires the `en-US` locale.
If the user's session locale is anything else, the request redirects to `/`
with a flash message.

## Environments

| Environment | `levelbuilder_mode` default | Notes |
|---|---|---|
| `levelbuilder` | `true` | The dedicated authoring server. Extends the staging environment config. Disables `Rails.cache` and `cache_classes` so edits appear immediately. |
| `development` | `false` | Set `levelbuilder_mode: true` in `locals.yml` to enable locally. |
| `staging` | `false` | |
| `test` | `false` | CanCanCan grants Levelbuilder abilities in the test environment even without `levelbuilder_mode`, so UI tests can cover editing flows. The `require_levelbuilder_mode_or_test_env` gate admits test requests. |
| `production` | `false` | Hardcoded off in practice. The config reads `CDO.with_default(false).levelbuilder_mode`, and no production deployment sets the override. |

Every environment reads `CDO.with_default(false).levelbuilder_mode` except
`levelbuilder`, which uses `CDO.with_default(true).levelbuilder_mode`. The
override source is `locals.yml` (via the `CDO` configuration object).

## Running locally in Levelbuilder mode

To enable Levelbuilder locally, add this line to `locals.yml` (in the repo
root):

```yaml
levelbuilder_mode: true
```

Then restart the Rails server. The Levelbuilder editors become available at
their normal routes (for example, `/levels/new`, `/s/<unit>/edit`).

Be careful: saving in Levelbuilder mode writes files under `dashboard/config/`.
If you do not intend to commit those changes, revert them before switching
branches.

## Related

- [Curriculum authoring](/developers/curriculum/curriculum-authoring/) --
  the editors and object hierarchy available once Levelbuilder is enabled.
- [Curriculum pipeline](/developers/curriculum/curriculum-pipeline/) --
  what happens to the files Levelbuilder writes.
