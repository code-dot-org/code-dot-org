---
title: Publishability tiers
description: The four tiers that determine which project types can be shared and published.
type: reference
---

Project types are classified into four publishability tiers in
`lib/cdo/shared_constants.rb`. The tier determines whether a project can be shared
via link and whether it can be published to the public gallery.

## Tiers

### Always publishable

These project types can be shared and published by anyone, regardless of age or
teacher settings.

`artist`, `frozen`, `playlab`, `gumball`, `iceage`, `infinity`,
`minecraft_adventurer`, `minecraft_designer`, `minecraft_hero`, `minecraft_aquatic`,
`starwars`, `starwarsblocks`, `starwarsblocks_hour`, `flappy`, `bounce`, `sports`,
`basketball`, `artist_k1`, `playlab_k1`, `dance`, `poetry`, `poetry_hoc`,
`thebadguys`, `music`, `pythonlab`

### Conditionally publishable

These project types can be shared and published only if the student meets the age
and teacher-setting conditions described in
[Sharing and abuse](/developers/projects/sharing-and-abuse/).

`applab`, `gamelab`

### Restricted publish

These project types can be shared via link, but publishing to the gallery is blocked
when the project enters restricted share mode (triggered by a student uploading an
image). Remixing is also disabled in restricted mode.

`spritelab`

### Unpublishable

These project types cannot be published to the public gallery. They may still have
share links for direct viewing.

`algebra_game`, `calc`, `eval`, `minecraft_codebuilder`, `weblab`

## Where tiers are enforced

- **Frontend:** `headerShare.js` checks `AllPublishableProjectTypes` to decide
  whether to show the publish button. `ShareAllowedDialog.jsx` gates the publish
  action.
- **Backend:** `ProjectsController#can_publish_age_status` returns age-based
  eligibility for the publish UI.

## Related

- [Sharing and abuse](/developers/projects/sharing-and-abuse/)
- [Project storage](/developers/projects/project-storage/)
