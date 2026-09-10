---
title: Curriculum authoring
description: The object hierarchy curriculum authors edit, the editors available in Levelbuilder, and the publishing lifecycle.
type: concept
---

**Applies to:** curriculum authors, engineers.

Curriculum objects, the editors that modify them, and the publishing states
that control visibility are described below as orientation, not a per-editor
manual.

## Object hierarchy

Curriculum is a tree. From the top:

```
CourseOffering          (e.g. "CS Principles")
  CourseVersion         (e.g. "2024", linked to an offering)
    UnitGroup           (groups units; the content_root of a CourseVersion)
      Unit              (a sequence of lessons; table name: scripts)
        LessonGroup     (a named group of lessons within a unit)
          Lesson        (table name: stages)
            LessonActivity
              ActivitySection
                ScriptLevel  (joins a Lesson position to a Level)
                  Level      (the actual puzzle or content page)
```

A standalone unit (one that is not part of a multi-unit course) has its own
`UnitGroup` with a single unit. The `CourseVersion.content_root` always
points to a `UnitGroup`.

Some objects sit beside this tree rather than inside it:

- **Resources** attach to a lesson or a unit (teacher-facing and student-facing).
- **Vocabularies** attach to a lesson.
- **Standards** and **opportunity standards** attach to a lesson via a `Framework`.
- **Objectives** belong to a lesson.
- **Rubrics** belong to a lesson and contain **LearningGoals** with **LearningGoalEvidenceLevels**.

## Level types

Levels are the leaf nodes of the tree. Each level has a `type` column that
determines which lab or content renderer handles it. The most common types by
count in the database:

| Type | Count | Notes |
|---|---|---|
| `Multi` | ~14,300 | Multiple-choice question (DSL-defined) |
| `External` | ~13,100 | Markdown/HTML content page (DSL-defined) |
| `Applab` | ~10,200 | App Lab project level |
| `Javalab` | ~8,100 | Java Lab project level |
| `FreeResponse` | ~6,200 | Open-ended text response |
| `Gamelab` | ~5,800 | Game Lab project level |
| `BubbleChoice` | ~4,000 | Student picks from a set of sub-levels |
| `GamelabJr` | ~3,700 | Sprite Lab (block-based Game Lab) |

About 60 level types exist in total (`dashboard/app/models/levels/`). Some are
DSL-defined (Multi, External, Match, EvaluationMulti, ContractMatch,
TextMatch); the rest store their configuration as JSON in a `.level` file.

### Storage split

- **DSL-defined levels** live under `dashboard/config/scripts/` as `.multi`,
  `.external`, `.match`, and similar files alongside the unit that uses them.
  There are roughly 36,000 such files.
- **Custom (JSON) levels** live under `dashboard/config/levels/custom/<type>/`
  as `.level` files. There are roughly 64,000 such files.
- **Unit definitions** live in `dashboard/config/scripts_json/` as
  `.script_json` files (~1,800 files). These contain the full serialized tree
  from the unit down, produced by `Services::ScriptSeed.serialize_seeding_json`.
- **Courses** are in `dashboard/config/courses/` (~900 files) and
  **course offerings** in `dashboard/config/course_offerings/` (~740 files).

## Editors

Each object in the hierarchy has an editor reachable at a Levelbuilder route.
All require [Levelbuilder access](/developers/curriculum/levelbuilder-environment/).

| Editor | Route pattern | What it edits |
|---|---|---|
| Level editor | `/levels/:id/edit`, `/levels/new` | A single level's properties, instructions, and configuration. |
| Block palette editor | `/levels/:id/edit_blocks/:type` | Which blocks a Blockly-based level offers. |
| Exemplar / start code | `/levels/:id/edit_exemplar` | The starter code students see and the exemplar solution for teachers. |
| Lesson editor | `/lessons/:id/edit` | The lesson plan: activities, activity sections, level sequence, resources, vocabulary, standards. |
| Unit editor | `/s/:name/edit` | Lesson order, lesson groups, unit properties, announcements. |
| Course editor | `/courses/:name/edit` | Which units belong to this course and in what order. |
| Course offering editor | `/course_offerings/:key/edit` | Metadata: display name, grade levels, curriculum type, image. |
| Publishing editor | (within the course version UI) | The `published_state` of a course version. |

### Supporting catalog editors

| Editor | Route pattern | Purpose |
|---|---|---|
| Resources | `/resources` | Attachable links (slide decks, answer keys, activity guides). |
| Vocabularies | `/vocabularies/search` | Key terms for a lesson. |
| Standards | `/standards/search` | CSTA, NGSS, and other framework alignments. |
| Code docs | `/programming_environments/new`, `/programming_expressions/:id/edit` | Block and API documentation students see in the IDE. |
| Data docs | `/data_docs/edit` | Dataset descriptions for App Lab's data features. |
| Reference guides | `/courses/:name/guides/edit` | Per-course reference pages. |

### Auxiliary authoring tools

- **Rubrics:** `/rubrics/new`, `/rubrics/:id/edit`. Define learning goals and
  evidence levels for a level. Rubric authoring requires Levelbuilder mode;
  viewing and evaluating rubrics do not.
- **Quiz questions:** `/quiz_questions`. Standalone question bank; questions are
  placed into levels via `quiz_question_placements`.
- **Practice problems:** `/practice_problems`. Extra exercises tied to lesson
  objectives, seeded from `dashboard/config/practice_problems/`.
- **Callouts:** `/callouts`. In-level hint bubbles pointing students at a UI
  element.
- **Slides:** `/lessons/:id/slides/generate`. Generate presentation slides from
  a lesson plan.
- **Videos and sprites:** `/videos`, `/sprites`. Upload and manage media assets.
- **Foorm forms:** `/foorm/forms/editor`. Internal survey/form builder, used
  mainly for professional learning workshops. Foorm preview renders a 404 in
  production.
- **Announcements:** Inline in the unit editor. Banner messages shown to
  teachers on a unit page.
- **AI generators:** `/s/:name/generate`, `/lessons/:id/generate`. Produce a
  first draft of a unit or lesson. Available only in Levelbuilder mode.
- **Widget2:** `/widget2`. Edits standalone widget content outside the level
  system. Levelbuilder-only. Distinct from the `Widget` level type.

## Publishing lifecycle

A course version progresses through these `published_state` values:

| State | Meaning |
|---|---|
| `in_development` | Default. Visible only to Levelbuilder users. |
| `pilot` | Visible to users in a pilot experiment (and Levelbuilder users). |
| `beta` | Publicly visible but labeled as beta. |
| `preview` | Publicly visible, available for assignment. |
| `stable` | Fully launched. |
| `sunsetting` | Still accessible but being phased out. |
| `deprecated` | Hidden from the catalog. Existing assignments may still resolve. |

The `published_state` column exists on `CourseVersion`, `UnitGroup`, and `Unit`.
The values are defined in
`lib/cdo/shared_constants/curriculum/shared_course_constants.rb`.

Authors set the state through the publishing editor. See
[Who can see this course](/guide/curriculum/who-can-see-this-course/) for
the teacher-facing explanation of visibility.

## Related

- [Levelbuilder environment](/developers/curriculum/levelbuilder-environment/) --
  how to get access.
- [Curriculum pipeline](/developers/curriculum/curriculum-pipeline/) --
  how edits reach production.
- [Data model and seeding](/developers/curriculum/data-model-and-seeding/) --
  the models behind these editors.
