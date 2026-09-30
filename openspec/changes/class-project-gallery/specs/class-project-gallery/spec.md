## ADDED Requirements

### Requirement: The gallery lists each student's saved project per tagged level
`GET /class_gallery_projects?unit_id=U[&section_id=S]` SHALL return one entry
per student per tagged script level in unit U, for the students of section S,
or for the signed-in user alone when S is absent. An entry SHALL exist only
when the student's channel for that level is active and has been saved at
least once since it was created. When a student has several such channels
for one tagged level (a bubble choice where they opened several choices),
the entry SHALL be the most recently saved.

#### Scenario: Saved project on a tagged level
- **WHEN** a section student has saved work in the channel behind a tagged level in unit U
- **THEN** the listing for the section and U contains one entry for that student and level

#### Scenario: Channel opened but never saved
- **WHEN** a student opened a tagged level, which created a channel, but never saved
- **THEN** the listing contains no entry for that student and level

#### Scenario: Untagged level
- **WHEN** a student saved work on a level whose script level is not tagged
- **THEN** the listing contains no entry for it

#### Scenario: Deleted project
- **WHEN** the student's channel for a tagged level has state other than `active`
- **THEN** the listing contains no entry for it

#### Scenario: Several bubble choices opened
- **WHEN** a student saved work in two sublevels of a tagged bubble choice
- **THEN** the listing contains one entry for that bubble choice, for the channel saved most recently

#### Scenario: My projects
- **WHEN** a signed-in user requests the listing without `section_id`
- **THEN** the listing contains only that user's entries

### Requirement: Listing is limited to a section's members
The listing with `section_id` SHALL be available to the section's
instructors and students, by the `:list_projects` ability on the section,
and SHALL be refused with 403 to anyone else. Signed-out requests SHALL be
redirected to sign in.

#### Scenario: Section student lists their class
- **WHEN** a student of section S requests the listing for S
- **THEN** the response is 200 and includes classmates' entries

#### Scenario: Outsider is refused
- **WHEN** a user who neither teaches nor belongs to section S requests the listing for S
- **THEN** the response is 403

### Requirement: Listing order is selectable
Entries SHALL be ordered by their last save, newest first by default and
oldest first when `sort=oldest`.

#### Scenario: Default order
- **WHEN** the listing is requested without `sort`
- **THEN** entries appear newest save first

#### Scenario: Oldest first
- **WHEN** the listing is requested with `sort=oldest`
- **THEN** entries appear oldest save first

### Requirement: Per-unit counts back the unit list
`GET /class_gallery_projects/unit_counts?unit_ids=A,B[&section_id=S]` SHALL
return `{unit_id => count}` over the same scope and authorization as the
listing, for the given units.

#### Scenario: Counts for a course's units
- **WHEN** a teacher requests counts for units A and B of section S, and two students have saved tagged projects in A
- **THEN** the response is `{"A": 2}`, and B is absent or 0

### Requirement: Each entry carries what a card needs
Each entry SHALL include the channel id, project type, project name,
thumbnail URL (null when none was captured), last save time, the owner's id
and display name, the unit id, lesson position and lesson name, the script
level id and its position in the lesson, a share path, and the reaction
tallies as the challenge gallery shapes them. The share path SHALL be
`/projects/<type>/<channel>` when the type has a project share view and null
otherwise.

#### Scenario: Music Lab project
- **WHEN** an entry's project type is `music`
- **THEN** its share path is `/projects/music/<channel>`

#### Scenario: Project type without a share view
- **WHEN** an entry's project type is not a key of `ProjectsController::STANDALONE_PROJECTS`
- **THEN** its share path is null and its card offers no link

### Requirement: The Class Projects page presents the listing
The Tutor+ app SHALL render a Class Projects view at `…/tutor/gallery/projects`
behind the `lesson-tutor-challenge` experiment. It SHALL reuse the challenge
gallery's sidebar (section picker with "My projects", unit list with counts,
sort), group entries by tagged level in lesson order, and render one card per
entry showing the thumbnail or the project type's placeholder image, the
student's name, a "Unit N, Lesson M" label, the lab, and reaction chips. The
card's name and image SHALL open the share path in a new tab. A switcher
SHALL link the Class Projects and Extension Activities views.

#### Scenario: Switching views
- **WHEN** a viewer on the Extension Activities view selects "Class Projects"
- **THEN** the app navigates to `…/tutor/gallery/projects` without a page load and shows the Class Projects view

#### Scenario: Reload on the projects view
- **WHEN** a viewer reloads `…/tutor/gallery/projects`
- **THEN** Rails serves the gallery page and the Class Projects view renders

#### Scenario: Grouping
- **WHEN** a unit has tagged levels in lessons 5 and 9 with saved projects
- **THEN** the view shows a lesson 5 group before a lesson 9 group, each headed by its lesson name and project count

#### Scenario: Experiment off
- **WHEN** the `lesson-tutor-challenge` experiment is off for the viewer
- **THEN** the view renders nothing, as the challenge gallery does

### Requirement: Classmates may react to a project
The reaction endpoints SHALL add and remove the signed-in user's reaction on
a project and return its updated tallies:
`POST /class_gallery_projects/:channel_id/reactions {emoji}` and
`DELETE /class_gallery_projects/:channel_id/reactions/:emoji`. They SHALL be allowed to the project's owner, the owner's teachers,
and students who share a section with the owner, and refused with 403 to
anyone else. The emoji vocabulary SHALL be the challenge gallery's. Adding
an existing reaction and removing an absent one SHALL both succeed without
change.

#### Scenario: Peer reacts
- **WHEN** a classmate of the owner posts `heart`
- **THEN** the response is 200 with `[{emoji: "heart", count: 1, reacted: true}]`

#### Scenario: Outsider reacts
- **WHEN** a user who shares no section with the owner and does not teach them posts a reaction
- **THEN** the response is 403 and no reaction is stored

#### Scenario: Unknown emoji
- **WHEN** a permitted user posts `rocket`
- **THEN** the response is 422 and no reaction is stored

#### Scenario: Challenge reactions are unchanged
- **WHEN** a classmate reacts to a challenge response after this change
- **THEN** `POST /challenge_responses/:id/reactions` behaves exactly as before
