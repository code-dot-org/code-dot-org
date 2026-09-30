## Context

The Tutor+ challenge gallery (`apps/src/aiTutor/views/gallery/`) lists a
section's challenge submissions per unit, with a section picker, a unit list
with counts, sort, and emoji reactions. Its data lives in
`challenge_responses`, an ActiveRecord table keyed by `user_id`.

Project-level work lives elsewhere. Opening a level that saves a channel
creates a `channel_tokens` row keyed by (`storage_id`, `level_id`,
`script_id`) and a `projects` row whose `project_type` is the level's lab.
`level_id` is the level's host level: the project template level when the
level has one, so every level of a multi-level project shares one channel.
Saving sources updates `projects.updated_at`, in legacy labs
(`project.js#updateChannels_`) and Lab2 (`ProjectManager#saveHelper`)
alike; opening a level alone does not.

The Tutor+ page is served by `LessonsController#tutor` and `#tutor_gallery`
under `/s/:unit/lessons/:position/tutor…` and is mounted in a
`BrowserRouter` whose basename is `…/tutor`. Tutor is available only in units
whose course offering is an AI initiative.

## Goals / Non-Goals

**Goals:**

- Let curriculum writers mark project levels per unit.
- Show a section's saved projects for those levels, per unit, in the
  Tutor+ gallery, with reactions.
- Reuse the challenge gallery's sidebar, page styles and reaction chips.
- Tag enough levels in `.script_json` to test on an adhoc.

**Non-Goals:**

- An in-page project page like the challenge gallery's. Cards open the
  project's share view in a new tab.
- A "submitted" state. A project appears once it has been saved.
- The gallery outside Tutor-enabled units, and outside the
  `lesson-tutor-challenge` experiment.
- Consolidating challenge and project reactions into one table.
- Translating the page. The challenge gallery is English-only and so is
  this.

## Decisions

### The tag is a script-level property

`class_gallery` joins `challenge` and `show_ai_analysis` in
`ScriptLevel.serialized_attrs`. A script level is one level's use in one
unit, and gallery membership is a curriculum decision about that unit.
Seeding already copies `properties` wholesale, so the flag needs no seed
code, and the lesson editor's checkbox list is the established place for
per-use flags.

Alternatives: a level property would tag every unit that reuses the level.
Inferring projects from lesson titles or from "saves a channel" is wrong on
real units: project lessons open example levels that save channels, and most
channel-saving levels are exercises.

### Tag the finished level; resolve through host levels

The tag sits on the level students finish on, typically the last level of a
template-based project. The query resolves each tagged script level to host
level ids, expanding bubble choices to their sublevels, and looks up channel
tokens by (`script_id`, host `level_id`, student `storage_id`). One entry per
student per tagged script level; among several channels (bubble choices) the
most recently saved wins.

### Saved work is `projects.updated_at > projects.created_at`

Opening a level creates an empty channel, and the Sprite Lab image review
page (`SpritelabLab2ImagesReviewController`) filters these by reading S3.
That costs a request per channel. Comparing the row's timestamps costs
nothing, and both lab frameworks bump `updated_at` on every save. On local
data it separated opened-only Free Response, AI Chat and Web Lab 2 channels
from saved Music, Python Lab and Game Lab ones.

### Listing is a query object with a bounded number of queries

`ClassGallery` (`dashboard/app/models/class_gallery.rb`) takes student ids
and unit ids and issues: script levels of the units (through the unit cache),
storage ids for the students, channel tokens, projects, users, and project
reactions. Channel ids are computed from the loaded `projects` rows, as
`get_project_channel_id` would, without its per-call row read. This replaces
the per-student loop in `ProjectsList.fetch_section_projects`.

### Reactions get their own table, sharing the vocabulary

`project_reactions (project_id, user_id, emoji)` mirrors
`challenge_response_reactions`, keyed by `projects.id` as `code_reviews`
already is. The emoji list and the tally function move to
`EmojiReactions`, which both models use; `ChallengeResponseReaction::EMOJIS`
stays as an alias, so the challenge API and its tests do not change.

Alternative: a polymorphic `reactions` table. It is the right end state if
the gallery graduates, but it rewrites a shipped table for a prototype.

Reaction URLs are keyed by channel id, the identifier every other project
URL uses, and decoded with `Project.find_by_channel_id`.

### Authorization mirrors the challenge gallery

Listing a section authorizes `:list_projects` on the section, as
`ChallengeResponsesController#gallery_scope` does. Reacting authorizes a new
`:react_in_class_gallery` ability on `Project`, granted to the owner, the
owner's teachers, and anyone sharing a section with the owner: the same
relation as `can :read, ChallengeResponse`.

### The view is a second route in the Tutor+ app

`TutorApp` gains `gallery/projects`. Rails routes
`tutor/gallery/*path` to `#tutor_gallery`, ahead of `tutor/*path`, so a
reload lands on the gallery action instead of the deep dive. The switcher is
built in `TutorApp` and passed into each gallery as a prop, so the gallery
components stay free of router hooks and their existing tests keep rendering
them without a router.

### Cards link to the share view

`/projects/<type>/<channel>` is open to any signed-in viewer, works for the
owner, teachers and peers alike, and renders every lab involved. The
alternative, the level page with `?user_id=`, is teacher-only and needs the
lesson and level positions of a bubble choice's sublevel.

### `ReactionChips` takes an endpoint

`reactionsPath` replaces `responseId`; `reactionsApi` posts to it and
deletes `<path>/<emoji>`. The challenge gallery passes
`/challenge_responses/:id/reactions`.

## Risks / Trade-offs

- [Peers see work of students with sharing disabled] → Same as the
  challenge gallery; stays behind the experiment; listed as an open
  question.
- [`updated_at > created_at` misreads a lab that writes its channel on
  load] → Checked on local data for the labs being tagged; if one misreads,
  the fix is an S3 check for that lab only.
- [Old channel tokens with a null `script_id`] → Not matched. The tagged
  units are 2025 units, created after the `script_id` backfill.
- [Thumbnails are uneven] → Music Lab and Web Lab 2 capture none, and
  Python Lab only in Neighborhood mode. Cards fall back to the lab's
  placeholder image through `getProjectCardImageUrl`.

## Migration Plan

1. Deploy, which runs the `project_reactions` migration.
2. Seed the three tagged units:
   `bundle exec rake seed:single_script SCRIPT_NAME=<unit>`, which a full
   deploy seed also does.
3. Enable `lesson-tutor-challenge` for testers with
   `?enableExperiments=lesson-tutor-challenge`.

Rollback: remove the route and the tags; drop `project_reactions`.

## Open Questions

- Should classmates see projects of students with sharing disabled, or
  only their teacher?
- Should the gallery require a finished level (a passing `UserLevel`)
  rather than any save?
- Does the view belong outside Tutor-enabled units, and so outside the
  Tutor+ page?
