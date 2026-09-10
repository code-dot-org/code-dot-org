# Product taxonomy: studio.code.org (dashboard)

Repo: `code-dot-org/code-dot-org`, rev `9793f8d36ae`, branch `staging`.

This taxonomy exists to be carved into ownable documentation domains. Every
inventory item in `inventory.yaml` carries exactly one `area` from the list
below. Areas are drawn, in order of preference, along boundaries the
organization already uses: directory names under `dashboard/app/controllers`
and `apps/src`, the `frontend/packages/*` package split, the nav structure a
signed-in user sees, and the `dashboard/test/ui/features` directory grouping
(270 feature files, which is the closest thing the repo has to a product
outline).

Two boundary rules apply throughout:

- **Role is not an area.** "Teacher" is not a bucket. A teacher and a student
  both touch progress; they touch it from opposite ends of the same subsystem,
  so progress is one area with two roles. Splitting by role would duplicate
  every data model across two owners.
- **Runtime surface is an area; content authored for it is not.** The labs area
  covers the machinery that renders a level. The specific curricula authored
  with that machinery live in the curriculum area, and the tool used to author
  them lives in the levelbuilder area.

## Product areas

### identity-and-accounts
Everything that establishes who a user is and what their account holds:
sign-up (including the age gate and the separate simplified sign-up flow),
the six section login types, email/password credentials, picture and word
passwords for young students, OAuth via Google, Clever, Microsoft and
Facebook, LTI-provisioned identity, linked-account management, password
reset, `/users/edit` account settings, email preferences, account
deletion/purge, and the child-account-policy (CAP) consent machinery that
locks out under-13 students without parent permission. The boundary is
"claims about the user and their credentials". It stops where a user's
membership in a *section* begins — that is a different area — but it owns the
login-type constants because credentials are minted from them. Anchored in
`dashboard/app/models/user.rb`, `authentication_option.rb`,
`dashboard/app/controllers/{registrations,sessions,passwords,omniauth_callbacks,authentication_options}_controller.rb`,
`dashboard/lib/policies/child_account*`, `apps/src/{signIn,signUpFlow,simpleSignUp,accounts}`,
`frontend/packages/users`.

### sections-and-rosters
The classroom container and who is in it: creating and configuring a section
(login type, grade, participant type), section join codes, students joining
and leaving, teacher-managed student accounts, co-instructors
(`section_instructors`), section transfers, hidden units and lessons, demo
sections, and roster synchronization from Clever, Google Classroom and LTI.
The boundary is membership and section configuration, not what is assigned to
the section (curriculum area) and not what the members produce (progress
area). Anchored in `dashboard/app/models/sections/`, `follower.rb`,
`dashboard/app/controllers/{sections,followers,transfers}_controller.rb`,
`api/v1/sections*`, `apps/src/templates/{sections,sectionSetup,manageStudents}`,
`dashboard/lib/services/roster/`.

### curriculum-catalog-and-assignment
How courses are discovered, described and attached to a section: the
curriculum catalog, course and unit overview pages, `CourseOffering` /
`CourseVersion` / `UnitGroup` / `Unit` and their `published_state` lifecycle
(in_development → pilot → beta → preview → stable → sunsetting → deprecated),
instructor and participant audiences, quick assign, assigning a course or
unit to a section, lesson plans and lesson overview pages, resources,
standards, vocabulary, code documentation and reference guides. The boundary
is curriculum-as-metadata and its attachment to learners. Anchored in
`dashboard/app/models/{course_offering,course_version,unit_group,unit,lesson}.rb`,
`dashboard/config/{courses,course_offerings,scripts,scripts_json}`,
`lib/cdo/shared_constants/curriculum/shared_course_constants.rb`,
`dashboard/app/controllers/{courses,course_offerings,curriculum_catalog,scripts,lessons}_controller.rb`,
`apps/src/templates/{curriculumCatalog,courseOverview,lessonOverview}`.

### learning-experience-and-labs
The runtime a student actually works in. One area, because a level of any
type reaches the browser through the same handoff: `script_levels_controller`
resolves a `ScriptLevel`, `levels_helper` serializes the level's properties,
and the `apps/` bundle boots a lab against them. Covers the level-type
hierarchy (~50 subclasses under `dashboard/app/models/levels/`; observed 96,464
level rows locally, dominated by Multi, External, Applab, Javalab and
FreeResponse), the lab2 framework and its labs (Music, Weblab2, Pythonlab,
Aichat), the legacy labs (App Lab, Game Lab, Sprite Lab, Web Lab, Java Lab,
Artist, Maze, Dance, Craft, Bounce, Flappy, Poetry, Sketch Lab, NetSim,
CS-Principles widgets), Blockly and Droplet, level instructions, authored
hints, validation and milestone posting, contained levels, bubble choice,
level groups and assessments, videos, and unplugged levels. The boundary is
"the thing that runs when a student opens a bubble". Anchored in
`dashboard/app/controllers/script_levels_controller.rb`,
`dashboard/app/helpers/levels_helper.rb`, `apps/src/*` labs, `apps/src/lab2`,
`frontend/packages/labs`, `frontend/packages/blockly`.

### projects-and-sharing
Student-authored artifacts and their circulation: project creation and
storage (channels, `storage_id`, encrypted channel ids), the project list,
personal and section project galleries, publishing to the public gallery,
featured projects, remixing, sharing links and share warnings, abuse
reporting and the abuse threshold, project version history, libraries,
backpacks, datablock storage for data-backed projects, and Web Lab hosting.
The boundary is the artifact and its audience — distinct from the lab that
produced it. Project publishability is itself a policy surface
(`ALWAYS_PUBLISHABLE_PROJECT_TYPES` vs conditional vs restricted vs
unpublishable in `lib/cdo/shared_constants.rb`), which is why sharing is not
folded into labs. Anchored in
`dashboard/app/models/{project,channel_token,featured_project,library,backpack}.rb`,
`dashboard/app/controllers/{projects,featured_projects,libraries,backpacks,datablock_storage,report_abuse,weblab_host}_controller.rb`,
`apps/src/templates/projects`, `apps/src/storage`.

### progress-and-assessment
Both ends of "how is this learner doing": the student's own progress view and
the teacher's reporting views. Covers `UserLevel` / `UserScript` /
`LevelSource`, the progress bubbles and progress tables, section progress
(v1 and v2), section assessments and survey results, teacher feedback on
student work, rubrics and learning goals with their teacher and AI
evaluations, teacher scores, standards reports, lesson and objective
reflections, and peer review. The boundary is evaluation and its display; the
AI machinery that produces a rubric evaluation is described here as a
capability and in `ai-features` as a subsystem. Anchored in
`dashboard/app/models/{user_level,user_script,rubric,learning_goal,teacher_feedback,student_work_evaluation}.rb`,
`dashboard/app/controllers/{user_levels,teacher_feedbacks,rubrics,student_work_evaluations,survey_results}_controller.rb`,
`api/v1/{assessments,teacher_scores,teacher_feedbacks}`,
`apps/src/templates/{progress,sectionProgressV2,sectionAssessments,feedback,rubrics}`,
`frontend/packages/progress`.

### ai-features
The newest and least settled part of the product, and the one most heavily
gated. It gets its own area because it spans every other area's data (levels,
sections, progress, curriculum) while sharing one set of provider clients,
one safety pipeline and one flag family. Covers AI Chat (the `Aichat` level
type and the Chatter surface), AI Tutor, AI Differentiation (`aidiff`
threads, exit tickets, lesson hooks), AI lesson summaries and lesson-summary
podcasts, AI student podcasts, AI student snapshots, AI rubric assessment,
AI iteration and prompt-management tooling, the AI gateway and auth, PII and
profanity safety checks, and AI observability. Anchored in
`dashboard/app/controllers/ai*`, `aichat*`, `aidiff*`, `chatter_controller.rb`,
`dashboard/app/helpers/aichat_*`, `ai_system_prompts/`, `dashboard/app/jobs/*ai*`,
`dashboard/lib/policies/ai.rb`, `apps/src/{aichat,aiTutor,aiDifferentiation,aiEvaluation,aiGateway,aiTeacherDrawer}`,
`frontend/packages/ai-tutor`.

### professional-learning
Everything aimed at adults as learners rather than as instructors: PD
workshops and enrollment, session attendance, workshop surveys via Foorm,
teacher and facilitator applications, regional partners and their program
managers, PLC courses and enrollment evaluations, self-paced PL units, and
workshop certificates. This is a distinct area because it has its own
controller namespaces (`pd/`, `plc/`), its own audience concept
(`participant_type` of `teacher` or `facilitator` on a section) and its own
partner-facing roles. Anchored in `dashboard/app/controllers/{pd,plc}/`,
`api/v1/pd/`, `dashboard/app/models/pd/`, `dashboard/lib/pd/`,
`apps/src/code-studio/{pd,plc}`, `lib/cdo/shared_constants/pd/`.

### schools-districts-and-administration
School and district data and whatever authority sits above a single
classroom: `School` / `SchoolDistrict` / `SchoolInfo` / `UserSchoolInfo`,
school association in sign-up and account settings, the census and Amazon
Future Engineer surfaces, and any district- or school-level reporting. This
area is where the "district administrator" role would live. It is thin: see
`roles-and-permissions.md` — there is no `district_admin` user type, and the
district-facing capabilities that exist are largely partner-facing or
staff-facing rather than a self-service district dashboard. Anchored in
`dashboard/app/models/{school,school_district,school_info,user_school_info}.rb`,
`api/v1/{schools,school_districts,census}`, `api/v1/user_school_infos`,
`apps/src/{schoolInfo,templates/census}`.

### lms-and-integrations
Inbound integrations that let another system drive studio.code.org: LTI 1.3
(dynamic registration, deep linking, account linking, roster sync, section
provisioning), Clever, Google Classroom, and the outbound SSO integrations
into Discourse and Zendesk. Separated from `identity-and-accounts` because
the work is protocol plumbing and admin-facing configuration rather than
user-facing credential management, and because an LMS admin — the closest
thing to a district administrator with real power — operates here. Anchored
in `dashboard/app/controllers/{lti/,lti_v1_controller.rb,discourse_sso_controller.rb}`,
`dashboard/lib/{services,policies,queries}/lti*`, `dashboard/lib/clever`,
`dashboard/lib/services/{classlink,clever,roster}`.

### safety-privacy-and-compliance
Cross-cutting obligations that constrain other areas: COPPA and the
child-account-policy grace-period/lockout state machine, parental consent and
parent letters, the GDPR dialog, the age gate and `/too_young`, sharing
restrictions by age, profanity and PII filtering, abuse reporting thresholds,
account purge and PII scrubbing, inactivity cleanup, and policy-compliance
surfaces. It is an area rather than a footnote because it owns real user
journeys (a locked-out student, a parent granting permission) and its own
models and jobs. Anchored in `dashboard/app/models/cap/`,
`dashboard/lib/policies/child_account*`, `dashboard/app/controllers/{policy_compliance,too_young,profanity,report_abuse}_controller.rb`,
`dashboard/app/jobs/{cap,inactivity_cleanup,user}/`, `apps/src/templates/policy_compliance`.

### recognition-and-marketing-surfaces
Public and celebratory surfaces: certificates (per-course and Hour of Code,
printed and shareable), the congrats page, Hour of Code entry points and
downloads, the scrapbook, teacher promotions, the incubator, and the public
marketing pages served by dashboard. Grouped because they share a
characteristic no other area has — they are largely reachable without an
account, and they are content-driven rather than data-driven. Anchored in
`dashboard/app/controllers/{certificates,print_certificates,certificate_images,congrats,hoc_download,scrapbook,incubator}_controller.rb`,
`dashboard/app/controllers/marketing/`, `apps/src/templates/certificates`.

### notifications-and-email
Transactional email and in-product notification: every mailer
(`follower_mailer`, `teacher_mailer`, `parent_mailer`, `lti_mailer`,
`peer_review_mailer`, `inactive_user_purge_mailer`, the `pd/` mailers), the
delivery pipeline and its interceptors, email preferences, and the in-product
notification and callout mechanisms. Small but it is the only area that owns
the deep links arriving from outside the product, which makes it a real entry
point surface. Anchored in `dashboard/app/mailers/`, `dashboard/app/views/*_mailer/`,
`dashboard/lib/notifications*`, `dashboard/app/controllers/{notifications,callouts}_controller.rb`.

### levelbuilder-and-curriculum-authoring
The internal authoring tool. Coarse grain by instruction. Covers the level
editor and every level-type editor, the lesson / unit / course / course
offering / course version editors, the publishing editor, resources,
standards, vocabulary, programming environments and expressions, reference
guides, data docs, quizzes and practice problems, Foorm form authoring,
lesson slides, block and shared-Blockly-function editors, sprite management,
level starter assets, the curriculum and lesson generators, and the
AI-assisted authoring tools. Its distinguishing property is its gate:
authoring is reachable only where `Rails.application.config.levelbuilder_mode`
is true (`dashboard/app/controllers/application_controller.rb:286`), which is
the `levelbuilder` Rails environment and any local server with
`levelbuilder_mode: true` in `locals.yml` — not production studio. Anchored in
`apps/src/levelbuilder/`, `dashboard/app/controllers/{levels,lessons,scripts,programming_*,resources,standards,vocabularies,quizzes,practice_problems,foorm}*`,
`dashboard/config/scripts*`.

### internal-staff-tools
Code.org staff surfaces that are not authoring: admin reports and search,
admin user management, pilot management, NPS, the DCDO and Gatekeeper
configuration UIs, the experiments UI, feature mode, pools, and the
staff-only test and dev controllers. Separated from levelbuilder because the
gate is different — these are gated on `UserPermission` values held by staff
accounts rather than on `levelbuilder_mode`. Anchored in
`dashboard/app/controllers/admin_*`, `{dcdo,gatekeeper,gates,experiments,feature_mode,pools,dev,test}_controller.rb`,
`apps/src/templates/admin`.

## Developer areas

Developer-facing items carry `roles: [developer]` and a blank `user_goal`.
They use the same `area` field with these additional values; the detail lives
in `architecture-map.md`.

- **dev-rails-platform** — the Rails app's shape: engines, `Services::` /
  `Policies::` / `Queries::` conventions, models, background jobs, caching,
  the root-level `lib/` and `shared/` Ruby that sits outside Rails.
- **dev-frontend-platform** — `apps/` (one webpack bundle, opt-in rspack),
  `frontend/` (Turborepo packages and the Vite apps), the design system, the
  lab2 framework as a framework, Blockly as a vendored fork, and the
  `apps/`-to-`dashboard/` handoff.
- **dev-auth-and-authz** — Devise, OmniAuth, CanCanCan, `UserPermission`,
  session and cookie mechanics, LTI as a protocol.
- **dev-curriculum-pipeline** — the serialize/seed round trip between
  `dashboard/config/*` files and the database, and the levelbuilder write-back.
- **dev-availability-and-config** — DCDO, Gatekeeper, experiments, pilots,
  `locals.yml` and `config/*.yml.erb`, Rails environments.
- **dev-testing-and-verification** — jest, minitest, vitest, Cucumber UI
  tests, Playwright e2e, Applitools Eyes, seeded data, test-only APIs.
- **dev-deploy-and-infra** — Drone and GitHub Actions, the studio deploy
  package, containers, k8s, AWS, observability, and the legacy Chef cookbooks.
- **dev-i18n** — the localization sync pipeline and Global Edition.

## Explicitly out of scope

`pegasus/` is the legacy Sinatra-based CMS that serves code.org (the marketing
and support site) rather than studio.code.org; it is mostly deprecated and is
excluded from this inventory except where studio depends on its middleware or
its shared cookie domain.
