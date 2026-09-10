# Cross-domain user journeys

Each journey is a numbered step list. Bracketed slugs are `inventory.yaml`
ids. A journey earns its place here only if it crosses at least two top-level
areas, because the point of the list is to show an orchestrator where domain
boundaries will need to hand off.

Evidence: journeys 1-8 and 12 are STRONGLY SUPPORTED, assembled from Cucumber
features and Playwright specs that exercise the whole path. The rest are
INFERRED from routes and code and should be walked once before being written
up as documentation.

## 1. Teacher sets up a class and a student joins it

The core onboarding path. Four areas.

1. Teacher creates an account and says what school they teach at
   [`signup-teacher`, `school-association-signup`]
2. Teacher creates a section and picks a login type
   [`teacher-section-create`, `teacher-section-choose-login-type`,
   `teacher-section-participant-type`]
3. Teacher either types students in, or imports a roster
   [`teacher-add-students-manually`] or [`teacher-roster-sync-google`,
   `teacher-roster-sync-clever`, `teacher-roster-sync-lti`]
4. Teacher prints logins or a parent letter to send home
   [`teacher-section-login-info`, `teacher-parent-letter`]
5. Student joins with the section code, or signs in with the picture or word
   password the teacher handed out
   [`student-join-section-by-code`, `signin-picture-password`,
   `signin-word-password`]
6. Teacher sees the student appear on the roster [`teacher-roster-view`]

Anchors: `dashboard/test/ui/features/platform/teacher_dashboard/manage_students_tab.feature`,
`frontend/packages/e2e-tests/tests/manage-students/manage-students-tab.spec.ts`,
`frontend/packages/e2e-tests/tests/shared/auth.ts` (`createTeacherAssociatedStudent`
performs exactly steps 2, 3 and 5 in one call).

## 2. Teacher assigns a course and a student works through it

1. Teacher browses the catalog or takes a quick-assign suggestion
   [`browse-curriculum-catalog`, `teacher-quick-assign`]
2. Teacher reads the course and unit overviews to decide
   [`view-course-overview`, `view-unit-overview`]
3. Teacher assigns the course to one or more sections
   [`teacher-assign-course-to-section`]
4. Student sees the assignment on their home page
   [`student-see-assigned-course`]
5. Student opens a level and works it [`student-work-a-level`]
6. Progress is saved on each run and submit [`level-milestone-post`]
7. Student sees their own bubbles fill in [`student-progress-view`]
8. Teacher watches the section progress view [`teacher-section-progress`]

Anchors: `dashboard/test/ui/features/teacher_tools/course_overview.feature`,
`level_navigation.feature`, `progress.feature`.

## 3. Teacher reviews and grades an assessment

1. Teacher hides the lesson until class is ready, or locks the assessment
   [`teacher-hide-units-and-lessons`, `teacher-lesson-lock`]
2. Student takes the multi-question assessment [`level-group-assessment`]
3. Student writes free-response answers [`level-group-assessment`]
4. Teacher reads results in the assessments view
   [`teacher-section-assessments`, `teacher-text-responses`]
5. Teacher grades against the rubric [`rubric-view`,
   `rubric-teacher-evaluation`]
6. Teacher records a score [`teacher-scores`]
7. Teacher leaves written feedback [`teacher-give-feedback`]
8. Student reads the feedback [`student-read-feedback`]

Anchors: `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_assessments1.feature`,
`dashboard/test/ui/features/teacher_tools/level_types/level_group.feature`,
`dashboard/test/ui/features/teacher_tools/rubrics`.

## 4. Teacher uses AI to grade, then corrects it

Crosses progress-and-assessment and ai-features, which is why those two areas
must agree on a shared vocabulary.

1. Teacher opens a rubric-backed level's grading view [`rubric-view`]
2. Teacher runs AI evaluation for one student or the whole section
   [`rubric-ai-evaluation`]
3. Job runs, hits per-student and per-teacher limits of 10, and may return a
   PII or profanity violation status instead of a grade
   [`rubric-ai-evaluation`, `ai-safety-pipeline`]
4. Teacher reviews the AI's proposal and overrides it
   [`rubric-teacher-evaluation`]
5. Teacher tells us the AI was wrong [`rubric-ai-feedback-loop`]
6. Teacher submits the final evaluations [`rubric-teacher-evaluation`]

Availability: `ai-gateway-enabled`, plus the per-user `ai_rubrics_disabled`
opt-out.

## 5. Student builds a project and shares it

1. Student starts a project from the Create menu or a lab
   [`student-create-project`]
2. Student works in the lab and the project autosaves
   [`lab-applab`, `project-open-and-edit`]
3. Student restores an earlier version after breaking something
   [`project-version-history`]
4. Student clicks share and gets a warning about personal information
   [`project-share-warnings`]
5. Share eligibility is decided by project type, then age, then the teacher's
   sharing setting [`project-share-link`, `project-publish-to-gallery`]
6. Student sends the link, or texts it to their phone
   [`project-share-link`, `sms-send`]
7. Someone else finds it in the public gallery and remixes it
   [`project-public-gallery`, `project-remix`]
8. Someone reports it; over an abuse score of 15 the project is blocked
   [`project-report-abuse`]
9. Staff resets the abuse score or unblocks it
   [`project-abuse-moderation`]

Anchors: `dashboard/test/ui/features/teacher_tools/projects/projects.feature`,
`project_sharing.feature`,
`frontend/packages/e2e-tests/tests/projects/public-project-gallery.spec.ts`.

## 6. Under-13 student in a covered state hits the parent-permission wall

The clearest example of safety-privacy-and-compliance constraining another
area rather than standing alone.

1. Student signs up with their own email and gives an age under 13
   [`signup-student`, `signup-age-gate`]
2. `Policies::ChildAccount` finds a state policy, an underage student, and a
   personal account, so parent permission is required [`cap-lockout`]
3. Account enters the grace period and the student is asked for a parent
   email [`cap-parent-permission-request`]
4. Parent gets an email with a uuid link [`email-parent-messages`]
5. Parent opens the unauthenticated consent page and approves
   [`cap-parent-grants-permission`]
6. `cap_status` becomes permission granted and the student continues
   [`cap-lockout`]
7. If nobody responds by the state lockout date, the lockout job locks the
   account [`cap-lockout`]
8. Meanwhile the teacher can see which of their students are at risk
   [`cap-teacher-visibility`]

Anchors: `frontend/packages/e2e-tests/tests/policy-compliance/parental-permission.spec.ts`,
`lockout-phase.spec.ts`, `policy-compliance.spec.ts`.

## 7. Teacher arrives from an LMS and their roster follows

1. LMS admin installs the integration, by hand or by dynamic registration
   [`lms-admin-integration-setup`]
2. Teacher picks Code.org content inside the LMS [`lms-deep-linking`]
3. Teacher clicks through and lands signed in via the LTI launch
   [`signin-lti`]
4. Teacher already had a Code.org account, so they link it
   [`account-linking-lti`]
5. Roster syncs from the LMS into an `lti_v1` section
   [`teacher-roster-sync-lti`]
6. Students launch from the LMS and appear in the section [`signin-lti`]
7. Teacher assigns a course as usual [`teacher-assign-course-to-section`]

Availability: per-integration; roster sync is separately gated by
`Policies::Lti.roster_sync_enabled?`. Whether this can be exercised locally
without external secrets is unresolved.

## 8. Anonymous visitor does an Hour of Code and gets a certificate

1. Visitor arrives from code.org and lands on a tutorial
   [`home-page-signed-out`, `hour-of-code-entry`]
2. Visitor works the puzzles with no account [`lab-hoc-one-offs`,
   `lab-maze-karel`, `student-work-a-level`]
3. Progress is kept in client state, not a user record
   [`level-milestone-post`]
4. Visitor reaches the congrats page and enters a name
   [`certificate-course-completion`]
5. Visitor gets a certificate, and may be nudged to make an account
   [`certificate-course-completion`, `signup-student`]
6. Teacher who ran the session prints certificates for the whole class
   [`certificate-batch-print`]

Anchors: `dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature`.

## 9. Curriculum author writes a lesson and it reaches production

The only journey that crosses an environment boundary, and the reason
levelbuilder is its own area.

1. Author edits a level in the level editor on the levelbuilder server
   [`lb-level-editor`]
2. Author writes the lesson plan and generates slides
   [`lb-lesson-editor`, `lb-slides-generator`]
3. Author attaches resources, standards and vocabulary
   [`lb-resources-standards-vocab`]
4. Author defines the rubric [`lb-rubric-editor`]
5. Author assembles the unit and course [`lb-unit-editor`, `lb-course-editor`]
6. Saving writes files under `dashboard/config`
   [`lb-curriculum-serialize-seed`]
7. A scheduled job merges the levelbuilder branch into staging, gated on a
   Slack deploy check [`lb-curriculum-serialize-seed`,
   `dev-curriculum-data-model`]
8. Other environments, production included, seed from the committed files
   [`lb-curriculum-serialize-seed`]
9. Author moves the course version from pilot to stable
   [`lb-publishing-editor`, `course-published-state-lifecycle`]
10. Teachers can now find it in the catalog
    [`browse-curriculum-catalog`]

Anchors: `dashboard/test/ui/features/teacher_tools/levelbuilder/level_edit_page.feature`,
`dashboard/lib/services/script_seed.rb`, `bin/cron/merge_lb_to_staging`,
`docs/update-levelbuilder.md`.

## 10. Feature ships behind a flag, then to everyone

1. Engineer adds a DCDO flag defaulting off, or an experiment
   [`staff-dcdo-console`, `dev-rails-environments`]
2. Staff create a `Pilot` record and add teachers by email
   [`staff-pilot-management`]
3. Teachers join from an emailed link
   [`user-join-pilot-by-link`]
4. The flag is flipped in the DCDO console, taking effect at runtime
   [`staff-dcdo-console`]
5. If load becomes a problem, a feature mode or a Gatekeeper kill switch
   turns it back off [`staff-feature-mode`, `staff-gatekeeper-console`]
6. The flag is collapsed once the rollout wins

## 11. Teacher trains, gets verified, then teaches CS A

Shows why professional-learning cannot be documented in isolation from
learning-experience-and-labs.

1. Teacher looks for training [`pl-landing-page`, `pl-find-workshop`]
2. Teacher applies to a program, and their principal confirms
   [`pl-teacher-application`, `pl-principal-approval`]
3. Teacher enrolls in and attends a workshop
   [`pl-enroll-in-workshop`, `pl-attend-workshop`]
4. Teacher works through a self-paced PL unit in a section whose
   `participant_type` is teacher [`pl-plc-course-enrollment`,
   `teacher-section-participant-type`]
5. Teacher's PL coursework is peer reviewed [`plc-peer-review`]
6. Teacher fills out the workshop survey and gets a certificate
   [`pl-workshop-surveys`, `pl-workshop-certificate`]
7. Teacher gains `AUTHORIZED_TEACHER`, so exemplars and answer keys unlock
   [`pl-teacher-preverification`, `lb-exemplar-and-start-code`]
8. Because the teacher is now a verified instructor, their CS A students can
   get a Javabuilder token and run Java [`lab-javalab`]

## 12. Student is stuck and gets help, escalating

1. Student reads the instructions [`level-instructions`]
2. A callout points at the right thing [`level-callouts`]
3. Student opens a hint [`level-authored-hints`]
4. Student asks the AI tutor [`ai-tutor`]
5. Student's teacher sees a snapshot of where they are stuck
   [`ai-student-snapshot`]
6. Teacher asks the AI teaching assistant for a differentiated version
   [`ai-differentiation-chat`, `ai-differentiation-artifacts`]
7. Teacher leaves feedback on the student's attempt
   [`teacher-give-feedback`]

Availability: heavily gated. `ai-teaching-assistant-launch`,
`ai-differentiation`, `ai-diff-drawer` and the tutor experiments all apply.

## 13. Teacher-managed student takes ownership of their account

1. Teacher created the account, so it has no email or password
   [`teacher-add-students-manually`]
2. Student signs in with a picture or word password
   [`signin-picture-password`]
3. Student decides they want their own login
   [`account-upgrade-to-personal`]
4. Student adds an email and password, or links Google
   [`account-email-change`, `account-linking-manage`]
5. If the student is underage in a covered state, CAP blocks the link until a
   parent grants permission [`cap-parent-permission-request`]
6. Student can now sign in without the section
   [`signin-email`, `signin-google`]

Open question: step 3 to 5 is the sharpest interaction between
identity-and-accounts and safety-privacy-and-compliance, and where in the UI
the CAP restriction surfaces is unresolved.

## 14. Section is retired at the end of the year

1. Teacher archives last year's sections [`teacher-section-archive`]
2. Teacher moves returning students into a new section
   [`teacher-section-transfer`]
3. Students who left unenroll themselves, and the teacher is emailed
   [`student-leave-section`, `email-student-unenrolled`]
4. Teacher invites a co-teacher to the new section
   [`teacher-coinstructor-invite`]
5. Accounts that go unused are warned, then deleted
   [`account-inactivity-deletion-warning`,
   `account-purge-and-pii-scrub`]

## 15. Support handles "my student cannot get in"

The staff-facing journey. It touches almost every area, which is why
internal-staff-tools is its own bucket.

1. Support looks the student up by email or section
   [`account-repair-tools`, `staff-section-lookup-undelete`]
2. Support checks whether the account is CAP-locked [`cap-lockout`]
3. Support assumes the student's identity to reproduce the problem
   [`account-impersonation`]
4. Support resets the password by hand [`account-repair-tools`]
5. If a section was deleted by mistake, support restores it
   [`staff-section-lookup-undelete`]
6. If progress was lost, support inspects or restores it
   [`staff-user-progress-tools`]

Every step is gated on `require_admin`, which is the `users.admin` boolean
column, not a `UserPermission`.

## 16. District wants to see what its schools are doing

Included because it is the journey the product story implies and the code does
not support. Documenting it honestly matters more than documenting it well.

1. District administrator hears about Code.org and follows the districts link
   in the header, which leaves studio for marketing pages on code.org
   [`district-admin-role-gap`]
2. They sign up. They get a plain teacher account, because there is no other
   kind [`signup-teacher`, `district-admin-role-gap`]
3. If they arrive through Clever as a `district_admin`, that role is discarded
   and they still get a teacher account [`signin-clever`]
4. They can record `educator_role: district_admin` on their profile. Nothing
   reads it [`district-admin-role-gap`]
5. The only district-scoped authority that actually exists is installing the
   LTI integration for the district's LMS
   [`lms-admin-integration-setup`]
6. The only district-shaped data flowing the other way is census reporting
   and school association, both entered by teachers
   [`school-census-submission`, `school-association-signup`]
7. To see a school's or district's activity, they must ask Code.org staff or a
   regional partner [`pl-regional-partner-admin`,
   `staff-level-completion-reports`]

See `roles-and-permissions.md` section 5 for the evidence that steps 2 to 4 are
accurate rather than an oversight in this inventory.
