## Why

The Tutor+ gallery lets a class browse and react to each other's challenge
submissions, but the larger body of student work in a unit, the projects
students build in project levels, cannot be seen by classmates at all. A
teacher can open one student's level at a time; there is no view of a
section's projects side by side. This change adds that view as a prototype,
reusing the challenge gallery's page shell, filters and reaction chips.

Nothing in the curriculum marks which levels are projects. Most levels that
save a channel are exercises (aif2-2025 alone has 61 Python Lab levels), and
project lessons also open example projects that save channels of their own.
So curriculum writers need a way to name the levels whose work belongs in
the gallery.

## What Changes

- New script-level property `class_gallery`, set per unit in the lesson
  editor as a checkbox beside Bonus, Assessment and Challenge, stored in
  `script_levels.properties` and serialized to `.script_json`.
- New endpoints `GET /class_gallery_projects` and
  `GET /class_gallery_projects/unit_counts`, which list the saved projects
  behind tagged levels for a section's students (or for the signed-in user
  alone) with per-unit counts. Authorization reuses the `:list_projects`
  section ability the challenge gallery already uses.
- New table `project_reactions` and endpoints
  `POST|DELETE /class_gallery_projects/:channel_id/reactions[/:emoji]`, so
  classmates can leave emoji reactions on projects. The six-emoji vocabulary
  and tally shape move into a module shared with challenge reactions; the
  challenge reaction API does not change.
- New route in the Tutor+ app, `…/tutor/gallery/projects`, rendering a
  "Class Projects" view: section picker, unit list with counts, sort, and
  one group of project cards per tagged level. A switcher links it with the
  existing "Extension Activities" view. It is gated by the same
  `lesson-tutor-challenge` experiment as the challenge gallery.
- `ReactionChips` takes its reactions endpoint as a prop instead of deriving
  it from a challenge response id.
- Tag five levels across three Tutor-enabled units for testing:
  programming-with-music-lab-2025 (lessons 5, 9 and 13), aif2-2025 (lesson
  13, a bubble choice of Python Lab levels) and
  ai-generated-design-pilot-2025 (lesson 13, a Web Lab 2 project).

## Capabilities

### New Capabilities

- `class-gallery-level-tagging`: how curriculum writers mark a unit's
  project levels for the class gallery, and how that mark is edited, stored
  and seeded.
- `class-project-gallery`: which projects a viewer sees for a section and
  unit, how each project is presented and opened, and who may react to it.

### Modified Capabilities

<!-- None. openspec/specs/ holds no spec for the challenge gallery. -->

## Impact

- `dashboard/app/models/script_level.rb`, `activity_section.rb`: new
  serialized attribute, saved from the lesson editor.
- `apps/src/levelbuilder/lesson-editor/LevelTokenDetails.jsx`,
  `LevelToken.jsx`: checkbox and tag.
- `dashboard/app/models/class_gallery.rb` (new): the listing query.
- `dashboard/app/controllers/class_gallery_projects_controller.rb`,
  `class_gallery_project_reactions_controller.rb` (new), `config/routes.rb`,
  `models/ability.rb`.
- `dashboard/db/migrate/…_create_project_reactions.rb`,
  `models/project_reaction.rb`, `models/concerns/emoji_reactions.rb` (new);
  `challenge_response.rb`, `challenge_response_reaction.rb` use the shared
  module.
- `frontend/packages/lesson-deep-dive/src/gallery/`: wire types and
  validator for class gallery projects. apps consumes the package's built
  `dist/`, so the package must be rebuilt.
- `apps/src/aiTutor/views/`: new `ClassProjectGallery`, `ClassProjectCard`,
  `GalleryViewSwitcher`; `TutorApp` route; `ChallengeGallery` gains the
  switcher; `ReactionChips` and `reactionsApi` take an endpoint.
- `dashboard/config/scripts_json/` for the three units above: `class_gallery`
  added to five script levels' properties. Seeding them is the only data
  change an adhoc needs, beyond the migration.
- Privacy: a class gallery shows a student's project to their section
  peers, including students whose account has sharing disabled (the default
  under 13). That matches the challenge gallery, which already shows peers
  each other's video and whiteboard submissions, but it is a decision to
  confirm before this leaves the experiment.
