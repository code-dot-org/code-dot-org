# curriculum-and-assignment plan

Rev 9793f8d36ae. Domain owner: Opus.

## Blocking questions

1. **UI label inconsistency: "section" vs "class section" vs "classroom section".**
   The i18n strings use all three interchangeably. Navigation says "Classroom Sections";
   the assign dialog says "Assign to section"; onboarding says "Create class section".
   Recommendation: use "section" in docs (shortest, most common in the UI). Fable to confirm.

2. **Scrapbook, incubator, and teacher promotions: document or omit?**
   Scrapbook is behind experiment `student-scrapbook` (not GA, not DCDO).
   Incubator is GA but hidden by `hide_incubator_link` (default false, so visible by default
   for English-speaking teachers). Teacher promotions are time-limited DCDO-gated marketing
   pages (best-of-stem-2024, curriculum-launch-2024, aif-launch, exploring-gen-ai-launch --
   all default false). Plan: document incubator (one short page, teacher audience); omit
   scrapbook and promotions.

3. **Global edition user-visible region selector.** The region selector is URL-path-based
   (e.g. `/in/catalog`). No explicit user-facing picker UI was found in this pass; the
   `ge_region` cookie is set by the URL path. Plan: one short concept page if the browser
   walk confirms a visible mechanism; otherwise evidence only.

## Terminology observed

- **course** -- the UI says "course" (course overview, catalog card title).
- **unit** -- the UI says "unit" on the overview page.
- **lesson** -- the UI says "lesson" on the plan page.
- **section** -- the primary in-UI term for a teacher's class grouping.
  "class section" and "classroom section" also appear. See blocking question 1.
- **assign** -- teachers "assign" a course or unit to a section.
- **catalog** -- `/catalog` page heading is "Curriculum Catalog".

## Pages: teacher audience

| path | type | goal / question | inventory ids | journey | screenshot |
|---|---|---|---|---|---|
| `teachers/curriculum/browse-the-catalog.md` | task | Find a course by grade, subject, and duration | browse-curriculum-catalog, curriculum-umbrella-and-content-area | J2 step 1 (catalog browse) | yes: catalog filters |
| `teachers/curriculum/course-overview.md` | task | See the units in a course and decide whether to teach it | view-course-overview | J2 step 2 | no |
| `teachers/curriculum/unit-overview.md` | task | See lessons, vocabulary, standards, and calendar for a unit | view-unit-overview, vocabulary-and-standards-view, curriculum-calendar | J2 step 2 | no |
| `teachers/curriculum/lesson-plan.md` | task | Prepare to teach a lesson: plan, slides, materials | view-lesson-plan, view-lesson-slides, view-lesson-materials | none | no |
| `teachers/curriculum/download-pdfs.md` | task | Download a printable copy of lesson plans or unit overview | curriculum-pdf-download | none | no |
| `teachers/curriculum/who-can-see-this-course.md` | concept | Which courses are visible to whom, by published state | course-published-state-lifecycle, instructor-and-participant-audience | none (code-derived) | no |
| `teachers/classes/assign-a-course.md` | task | Assign a course or unit to a section | teacher-assign-course-to-section, teacher-quick-assign | J2 step 3 (assign) | yes: assign dialog |
| `teachers/home/teacher-home-page.md` | task | See your sections, assignments, and what to do next | teacher-home-page | none | no |
| `teachers/certificates/print-certificates.md` | task | Print completion certificates for a section | certificate-batch-print | J8 step 6 | no |
| `teachers/curriculum/incubator.md` | concept | Try experimental activities in the incubator | incubator | none | no |

## Pages: student audience

| path | type | goal / question | inventory ids | journey | screenshot |
|---|---|---|---|---|---|
| `students/learning/see-your-assignments.md` | task | Find the course your teacher assigned | student-see-assigned-course, student-home-page | J2 step 4 (student sees assignment) | no |
| `students/learning/student-lesson-plan.md` | concept | Read the student version of a lesson | view-student-lesson-plan | none | no |
| `students/learning/code-documentation.md` | task | Look up a block or function | code-documentation-browse, data-library-browse, reference-guides-browse | none | no |
| `students/activities/hour-of-code.md` | task | Try coding in an hour, no account needed | hour-of-code-entry, lab-hoc-one-offs | J8 steps 1-3 (HoC entry) | no |
| `students/activities/get-a-certificate.md` | task | Get a certificate after finishing | certificate-course-completion | J8 steps 4-5 (certificate) | no |

## Pages omitted and why

| inventory id | reason |
|---|---|
| scrapbook | Behind experiment flag `student-scrapbook`, not GA |
| teacher-promotions | Time-limited DCDO-gated marketing pages, all default false |
| hour-of-code-app-download | Offline app download; low-confidence, low-traffic |
| curriculum-legacy-proxy | Internal redirect for old links; not a user-facing feature to document |
| home-page-signed-out | The signed-out landing page is brand-router-gated; content varies by brand. Document only if the browser walk reveals stable structure. Otherwise record evidence only. |
| global-edition-region | Will write one short concept page only if a user-visible region selector exists in the browser. Otherwise evidence only. |

## Second-level directory names

- `teachers/curriculum/` -- browsing, reading, and understanding courses and lessons
- `teachers/classes/` -- assigning curriculum to sections (shared with classrooms-and-progress)
- `teachers/certificates/` -- printing and managing certificates
- `teachers/home/` -- teacher home page
- `students/learning/` -- assignments, lesson plans, code docs
- `students/activities/` -- Hour of Code and certificates

## Cross-domain links (assumed paths, to be reconciled by Fable)

- "Create a section" links to `docs/teachers/classes/create-a-section.md` (classrooms-and-progress)
- "Get verified" links to `docs/teachers/professional-learning/get-verified.md` (professional-learning)
- "Do a level" links to `docs/students/learning/...` (labs-and-learning-experience)
- "Watch student progress" links to `docs/teachers/classes/...` (classrooms-and-progress)

## Journeys to verify

1. **Catalog browse** (J2 step 1): signed-out visit to `/catalog`, verify filters visible.
2. **Course overview** (J2 step 2): navigate from catalog card to a course overview page.
3. **Assign a course** (J2 step 3): create teacher, create section, assign from catalog.
4. **Student sees assignment** (J2 step 4): create student, join section, see assignment on home.
5. **Hour of Code + certificate** (J8): visit `/hoc/1`, work puzzles, reach congrats page.

## published_state visibility matrix (derived from code, Phase B will verify)

| state | Anonymous / student | Teacher (no perms) | Pilot teacher (experiment) | Levelbuilder |
|---|---|---|---|---|
| in_development | No | No | No | Yes |
| pilot | No | No | Yes (+ assigned students) | Yes |
| beta | Yes | Yes | Yes | Yes |
| preview | Yes | Yes | Yes | Yes |
| stable | Yes | Yes | Yes | Yes |
| sunsetting | Yes | Yes | Yes | Yes |
| deprecated | Yes | Yes | Yes | Yes |

The catalog only shows course offerings with at least one version in `preview` or `stable`
state, `assignable == true`, and `participant_audience == 'student'`. So `beta`, `sunsetting`,
and `deprecated` courses are readable by URL but not listed in the catalog. The
`can_view_version?` method on UnitGroup further restricts which version of a multi-version
course a participant sees (latest stable, or one they are assigned to / have progress in).
