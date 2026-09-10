# User roles and permissions in dashboard — research notes

Tags: STRONGLY SUPPORTED (code+test) / OBSERVED (db/runner) / INFERRED / AMBIGUOUS.

## 1. `User#user_type`

STRONGLY SUPPORTED. `dashboard/app/models/user.rb:170-184`:

```
self.inheritance_column = :user_type
...
USER_TYPE_OPTIONS = [
  TYPE_STUDENT = SharedConstants::USER_TYPES.STUDENT,
  TYPE_TEACHER = SharedConstants::USER_TYPES.TEACHER,
]
TYPE_TO_STI_CLASS_MAP = {
  TYPE_TEACHER => ::Teacher,
  TYPE_STUDENT => ::Student,
}
```

`lib/cdo/shared_constants.rb:801-804`:

```ruby
USER_TYPES = OpenStruct.new(
  STUDENT: 'student',
  TEACHER: 'teacher',
).freeze
```

So the exact, and only, values of `user_type` are `'student'` and `'teacher'`. `user_type` is also Rails' STI `inheritance_column`, so every `User` row is actually loaded as a `Student` or `Teacher` subclass (`app/models/student.rb`, `app/models/teacher.rb`). There is no `TYPE_ADMIN`, `TYPE_DISTRICT_ADMIN`, etc. — no third value exists or validates (`validates_inclusion_of :user_type, in: USER_TYPE_OPTIONS`, user.rb:435).

**"District administrator" is NOT a `user_type`, NOT a `UserPermission`, and NOT a distinct model.** It appears in exactly two places, both non-authorization:

1. STRONGLY SUPPORTED — a Clever OAuth roster-role mapping. `user.rb:210`: `CLEVER_ADMIN_USER_TYPES = ['district_admin', 'school_admin'].freeze`, consumed at `user.rb:1669-1672` inside `initialize_new_oauth_user`:
   ```ruby
   # treat clever admin types as teachers
   if CLEVER_ADMIN_USER_TYPES.include? user.user_type
     user.user_type = User::TYPE_TEACHER
   end
   ```
   A Clever-rostered district or school admin who signs in is silently created as an ordinary `teacher` account. Nothing distinguishes them afterward.

2. STRONGLY SUPPORTED — a self-reported profile/survey field, `EDUCATOR_ROLES`, `lib/cdo/shared_constants.rb:938-948`:
   ```ruby
   EDUCATOR_ROLES = [
     {value: "classroom_teacher", ...},
     ...
     {value: "school_admin", label: "School Administrator", category: "admin"},
     {value: "district_admin", label: "District Administrator", category: "admin"},
     {value: "parent", label: "Parent", category: 'other'},
     {value: "other", label: "Other", category: 'other'}
   ].freeze
   ```
   Used in `registrations_controller.rb`, `api/v1/users_controller.rb`, `user/settings_serializer.rb` — this is a dropdown value stored on the user's profile (`educator_role`), purely descriptive; grep across the codebase turns up no `if educator_role == 'district_admin'` authorization branch. It does not affect CanCanCan abilities, `UserPermission`, or any Section/School model.

Confirmed no code-level "district administrator" authority object exists at all — see item 5.

## 2. `UserPermission`

STRONGLY SUPPORTED. Full constant list, `dashboard/app/models/user_permission.rb:31-59`, comments verbatim:

```ruby
VALID_PERMISSIONS = [
  # Grants access to managing workshops and workshop attendance.
  FACILITATOR = 'facilitator'.freeze,
  # Grants access to managing (e.g., editing) levels, lessons, scripts, etc.
  # Also grants access to viewing extra links related to editing these.
  # Also makes the account satisfy verified_instructor?.
  LEVELBUILDER = 'levelbuilder'.freeze,
  # Grants ability to (un)feature projects in the the public project gallery.
  # Also, grants access to resetting (to 0) the abuse score for projects,
  # and blocking and unblocking legacy shares (formerly RESET_ABUSE).
  PROJECT_VALIDATOR = 'project_validator'.freeze,
  # Grants access to PLC workshop dashboards.
  WORKSHOP_ADMIN = 'workshop_admin'.freeze,
  # Grants access to managing professional development workshops and
  # professional development workshop attendance.
  WORKSHOP_ORGANIZER = 'workshop_organizer'.freeze,
  # Grants ability to conduct peer reviews for professional learning courses
  PLC_REVIEWER = 'plc_reviewer'.freeze,
  # Grants ability to view teacher markdown and level examples.
  # Also prevents account from being locked
  AUTHORIZED_TEACHER = 'authorized_teacher'.freeze,
  # Granted to regional partner program managers.
  # Initially has the same abilities as workshop organizer.
  PROGRAM_MANAGER = 'program_manager'.freeze,
  # Grants ability to be the instructor of any course no matter instructor_audience
  UNIVERSAL_INSTRUCTOR = 'universal_instructor'.freeze,
  #  Grants access to an internal tool to pull AI-evaluated samples of student work
  STUDENT_WORK_ACCESS = 'student_work_access'.freeze,
].freeze
```

Mechanism (`app/models/concerns/user_permission_grantee.rb`): `permission?(permission)` (line 17-26) returns `false` unless `teacher?` — **permissions can only ever be held by teacher-type accounts** — then checks a memoized `UserPermission.where(user_id: id).pluck(:permission)`. Every permission name also gets a dynamically-defined predicate: `UserPermission::VALID_PERMISSIONS.each {|name| define_method("#{name}?") {permission?(name)}}` (lines 49-53) — this is where `user.levelbuilder?`, `user.facilitator?`, `user.project_validator?`, `user.workshop_admin?`, `user.workshop_organizer?`, `user.plc_reviewer?`, `user.authorized_teacher?`, `user.program_manager?`, `user.universal_instructor?`, `user.student_work_access?` all come from.

Top call sites per permission (from `grep -rn "permission?(" app`, and the generated predicates):

- **LEVELBUILDER** — `ability.rb:484-486` (grants `can :manage` over curriculum models when `Rails.application.config.levelbuilder_mode` is also true — see item 6); `unit.rb:1949/1994`, `unit_group.rb:442/651/673`, `course_offering.rb:304` (bypass "hidden"/"in development" visibility checks); `javalab.rb:226` (levelbuilder-only validation UI).
- **PROJECT_VALIDATOR** — `ability.rb:310/446/606` (manage `FeaturedProject`, `LevelSource`, abuse scores); `report_abuse_controller.rb:33`, `project.rb:92` (owner immune from abuse auto-block); `levels_helper.rb:669` (`canResetAbuse` UI flag).
- **PLC_REVIEWER** — `ability.rb:314-319` (`can :manage, PeerReview`); `peer_reviews_controller.rb:68`; `sections_controller.rb:368` (API section-creation gating, alongside UNIVERSAL_INSTRUCTOR/LEVELBUILDER).
- **FACILITATOR** — `ability.rb:257-262` (manage own `Pd::Workshop` as facilitator); `sections_controller.rb:370`; `course_types.rb:56/75` (facilitator-only course visibility).
- **WORKSHOP_ORGANIZER** / **PROGRAM_MANAGER** — `ability.rb:264-291` (create/manage own `Pd::Workshop`s, plus regional-partner-scoped `Pd::Application` access when the user also has `regional_partners`).
- **WORKSHOP_ADMIN** — `ability.rb:293-308` (`can :manage, Pd::Workshop` / `RegionalPartner` / applications *globally*, no per-record scoping) — the broadest of the PD permissions; `pd/workshop_dashboard_controller.rb:9` (sees all regional partners, not just their own).
- **UNIVERSAL_INSTRUCTOR** — `section.rb:464`, `course_types.rb:50` (instructor of any course regardless of `instructor_audience`).
- **AUTHORIZED_TEACHER** — auto-granted after completing a PD workshop (`pd/enrollment.rb:321`) or PLC course (`plc/user_course_enrollment.rb:106`), or manually via `verify_teacher!`; checked as `verified_teacher?` in `discourse_sso_controller.rb:26`, `rubrics_controller.rb` (AI rubric visibility), `registrations_controller.rb:684`.
- **STUDENT_WORK_ACCESS** — `user.rb:902-904` `can_access_student_work?`; used for the internal AI-evaluation sample-pulling tool.

**Which permissions mean what** (INFERRED from purpose/scope, no single flag says "staff" explicitly):
- **Code.org staff / internal tooling**: `LEVELBUILDER` (curriculum authoring — combined with the `levelbuilder_mode` environment flag, see item 6), `PROJECT_VALIDATOR` (content moderation), `PLC_REVIEWER`, `UNIVERSAL_INSTRUCTOR`, `STUDENT_WORK_ACCESS` (explicitly "internal tool"), and `WORKSHOP_ADMIN` (unscoped global PD management — comment says "Grants access to PLC workshop dashboards" but the ability rules give it every `Pd::Workshop`/`RegionalPartner`, i.e. cross-partner admin).
- **External partner (regional partner staff who run PD)**: `FACILITATOR`, `WORKSHOP_ORGANIZER`, `PROGRAM_MANAGER` — these are scoped to workshops/applications tied to `user.regional_partners` (`ability.rb:270-290`), i.e. their own partner's territory only.
- **"District administrator"**: no `UserPermission` value represents this at all (see item 1/5).

## 3. CanCanCan `Ability`

STRONGLY SUPPORTED. Only one Ability class exists: `dashboard/app/models/ability.rb` (`grep -rln "include CanCan::Ability\|class Ability" dashboard lib` → single hit). It is initialized per-request with `user ||= User.new`, so anonymous visitors get the base rules too.

| Role / condition | Can | Subject / notes |
|---|---|---|
| Anyone (incl. signed out) | `read :all`, except an explicit blocklist (`User`, `UserPermission`, `Section`, `Pd::*`, `RegionalPartner`, curriculum models needing an override, etc. — `ability.rb:12-72`) | baseline |
| Any signed-in user (`user.persisted?`) | `manage` self; create/update own `Activity`, `UserLevel`, `Follower`(as student), `CodeReview`; read own `UserPermission`; code-review peers in shared sections; `read Pd::Session`; own `Pd::Enrollment` | `ability.rb:100-367` |
| `user.teacher?` | `manage` sections they instruct (`s.instructors.include?(user)`); destroy `SectionInstructor` rows except the section owner's (`si.instructor_id != si.section.user_id`); `manage` their students (`User`) unless a demo student; `manage Follower`, `UserLevel` for their students; create `TeacherFeedback`/`LessonFeedback` for their students | `ability.rb:203-255` |
| `user.facilitator?` | read/manage attendance for `Pd::Workshop` where `facilitators: {id: user.id}` or `organizer_id: user.id` | `ability.rb:257-262` |
| `user.workshop_organizer?` / `user.program_manager?` | create/manage own `Pd::Workshop`s; if `user.regional_partners.any?`, also workshops/applications scoped to those regional partners | `ability.rb:264-291` |
| `user.workshop_admin?` | `manage Pd::Workshop`, `Pd::CourseFacilitator`, `RegionalPartner`, `Pd::Application::ApplicationBase`/`TeacherApplication` — unscoped, global | `ability.rb:293-308` |
| `user.permission?(PROJECT_VALIDATOR)` | `manage FeaturedProject`, `LevelSource`; `destroy_abuse`/`update_file_abuse` on `:all` | `ability.rb:310-312, 606-612` |
| `user.permission?(PLC_REVIEWER)` | `manage PeerReview`, peer-review reports | `ability.rb:314-319` |
| `user.levelbuilder?` **and** `Rails.application.config.levelbuilder_mode` (or test env) | `manage` almost every curriculum model (`Level`, `Lesson`, `Unit`, `UnitGroup`, `Block`, `Video`, `Vocabulary`, Foorm forms, etc.), plus `:widget2` and level-starter-asset uploads | `ability.rb:484-536` — this is the only place raw `levelbuilder?` unlocks curriculum writes; outside `levelbuilder_mode`, a levelbuilder-permission user only gets the narrower reads/overrides scattered through the file |
| `user.admin?` | `manage :all`, with an explicit `cannot :manage` carve-out for curriculum/content models (`Activity`, `Game`, `Level`, `UnitGroup`, `CourseOffering`, `Unit`, `Lesson`, `ReferenceGuide`, `ScriptLevel`, `TeacherFeedback`, `UserLevel`, `UserScript`, `DataDoc`, Foorm) | `ability.rb:614-636` — so a plain admin does NOT get curriculum-editing power; that still requires `levelbuilder?` + `levelbuilder_mode` |

No role in this file is keyed on anything resembling "district admin" — confirms item 1/5.

## 4. Section membership

STRONGLY SUPPORTED.

- **Student in a section**: via `Follower` (`dashboard/app/models/follower.rb`), a join row `{student_user_id, section_id}` (`follower.rb:1-16`). `Section` declares `has_many :followers` / `has_many :students, through: :followers, source: :student_user` (`sections/section.rb:114-117`). Comment at `follower.rb:18-19`: `# Join table defining student-teacher relationships for Users (student_user is the student, user is the teacher)`.
- **Co-teacher / instructor**: via `SectionInstructor` (`dashboard/app/models/sections/section_instructor.rb`), columns `instructor_id`, `section_id`, `invited_by_id`, `status`. Full enum (lines 42-47):
  ```ruby
  enum status: {
    active: 0,
    invited: 1,
    declined: 2,
    removed: 3,
  }
  ```
  `Section` exposes `has_many :active_section_instructors, -> {where(status: :active)}` and `has_many :instructors, through: :active_section_instructors` (`sections/section.rb:105-107`).
- **`Section#user_id` (owner) vs. `section_instructors`**: `belongs_to :user` is `alias_attribute :teacher, :user` (`sections/section.rb:102-103`) — the section's creator/primary owner, validated to be a teacher (`sections/section.rb:387`: `errors.add(:user_id, 'must be a teacher') unless user.try(:teacher?)`). The primary owner also gets its own `SectionInstructor` row (co-teaching feature treats the owner as an instructor too), but `Ability` explicitly protects it: `can :destroy, SectionInstructor do |si| can?(:manage, si.section) && si.instructor_id != si.section.user_id end` (`ability.rb:208-210`) — any other instructor (co-teacher) can be removed by someone who can manage the section, but the row matching `section.user_id` (the owner) cannot be destroyed via this ability. `primary_instructor` in the serialized section summary (`sections/section.rb:627-631`) is always built from `teacher` (i.e. `user_id`), not from `instructors`.

## 5. School / district association

STRONGLY SUPPORTED — and the answer is "no such authorization construct exists."

- A user's school tie is `UserSchoolInfo` (`dashboard/app/models/user_school_info.rb`): `belongs_to :user`, `belongs_to :school_info`, plus `start_date`/`end_date`/`last_confirmation_date` (self-reported, re-confirmed periodically).
- `SchoolInfo` (`dashboard/app/models/school_info.rb:1-58`) stores demographic/self-report fields: `school_district_id`, `school_district_name`, `school_id`, `school_name`, `school_type` (`SCHOOL_TYPES` include `charter/private/public/homeschool/afterschool/organization/noSchoolSetting/other`). It optionally `belongs_to`s a canonical `School`/`SchoolDistrict` row but can also just carry free-text `school_district_other`/`school_name` when there's no NCES match.
- `School` (`dashboard/app/models/school.rb:32,60-64`) and `SchoolDistrict` (`dashboard/app/models/school_district.rb:20,36-37`) are reference data (NCES import): `School belongs_to :school_district`, `has_many :school_info`; `SchoolDistrict has_many :regional_partners, through: :regional_partners_school_districts`. Neither model has any association to a `User` as an administrator/owner — the only "authority" link is district → `RegionalPartner` (Code.org's own partner-territory bookkeeping, not a user role).
- `grep -rln "district_admin\|DistrictAdmin\|school_admin\|SchoolAdmin" dashboard/app dashboard/lib lib` returns only: Clever API client files (`dashboard/lib/clever/*`, third-party roster vocabulary, not our authorization), the `CLEVER_ADMIN_USER_TYPES` remap in `user.rb` (item 1), and the `EDUCATOR_ROLES` survey option in `shared_constants.rb` (item 1).
- **Conclusion: there is no model, column, or CanCanCan rule anywhere in dashboard/ that grants a user authority over a district or its schools.** "District administrator" exists only as (a) a Clever-import label immediately collapsed to `teacher`, and (b) a self-reported, non-authorizing profile field.

## 6. Other role-ish concepts

**`participant_type` / `instructor_audience` / `participant_audience` — the axis that actually decides who may instruct and who may participate, and how it interacts with `user_type`.** STRONGLY SUPPORTED, `lib/cdo/shared_constants/curriculum/shared_course_constants.rb:16-41,202-212`:

```ruby
# Used to determine who can teach a course
INSTRUCTOR_AUDIENCE = OpenStruct.new(
  {universal_instructor: "universal_instructor", plc_reviewer: "plc_reviewer", facilitator: "facilitator", teacher: "teacher"}
).freeze

# Used to determine who the learners are in a course
PARTICIPANT_AUDIENCE = OpenStruct.new(
  {facilitator: "facilitator", teacher: "teacher", student: "student"}
).freeze

# Sections have a participant_type and courses have a participant_audience. A section
# should never be assigned a course where the participants in the section can not be
# participants in the course. There this will tell you give the participant_audience of the
# course what the valid participant_types of a section are.
PARTICIPANT_AUDIENCES_BY_TYPE = OpenStruct.new(
  {student: ['student'], teacher: ['student', 'teacher'], facilitator: ['student', 'teacher', 'facilitator']}
).freeze
```

Two independent axes, both string enums, live on different objects:
- **`instructor_audience`** and **`participant_audience`** are properties of a *course* (`Unit`/`UnitGroup`/`CourseOffering`, via the `Curriculum::CourseTypes` concern, `dashboard/app/models/concerns/curriculum/course_types.rb`) — they say who is *allowed* to teach vs. take the course, independent of any one section.
- **`participant_type`** (`Section#participant_type`, `sections/section.rb:25`, `default("student"), not null`) is a property of a *section* — it says who this particular section's members actually are (`student`/`teacher`/`facilitator`), fixed permanently on creation (`participant_type_not_changed` validation, `section.rb:174-176`: `"can not be update once set."`).

`Curriculum::CourseTypes#can_be_instructor?(user)` (`course_types.rb`, quoted in full):
```ruby
def can_be_instructor?(user)
  return false unless user
  return false if user.student?
  return true if user.permission?(UserPermission::UNIVERSAL_INSTRUCTOR) || user.permission?(UserPermission::LEVELBUILDER)
  case instructor_audience
  when 'plc_reviewer' then return user.permission?(UserPermission::PLC_REVIEWER)
  when 'facilitator' then return user.permission?(UserPermission::FACILITATOR)
  when 'teacher' then return user.teacher?
  end
  false
end
```
and `#can_be_participant?(user)`:
```ruby
def can_be_participant?(user)
  return false if !user && participant_audience != 'student'
  return false if can_be_instructor?(user)
  case participant_audience
  when 'facilitator' then return user.permission?(UserPermission::FACILITATOR)
  when 'teacher' then return user.teacher?
  when 'student' then return true
  end
  false
end
```
So `user_type` (`student`/`teacher`) is the coarse gate — a `student?` account can never instruct anything, full stop — and `UserPermission` flags (`UNIVERSAL_INSTRUCTOR`, `PLC_REVIEWER`, `FACILITATOR`, or plain `teacher?`) refine *which* courses a given teacher-type account may instruct or join as a participant, per that course's declared audiences. `Ability` never reads `instructor_audience`/`participant_audience` directly — these methods are called from controllers/serializers (e.g. `api/v1/sections_controller.rb:368-370` gates section-course assignment) and from `Section` itself.

`Section` mirrors the same case-switch for its own `participant_type`, `sections/section.rb:463-475` (`can_join_section_as_participant?`, quoted verbatim):
```ruby
def can_join_section_as_participant?(user)
  return true if user.permission?(UserPermission::UNIVERSAL_INSTRUCTOR) || user.permission?(UserPermission::LEVELBUILDER)
  if participant_type == Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator
    return user.permission?(UserPermission::FACILITATOR)
  elsif participant_type == Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    return user.teacher?
  elsif participant_type == Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student
    return true
  end
  false
end
```
and enforces the cross-check at course-assignment time, `section.rb:479-481`:
```ruby
def self.can_be_assigned_course?(participant_audience, participant_type)
  Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCES_BY_TYPE[participant_type].include? participant_audience
end
```
i.e. a `student`-type section can only be assigned `student`-participant-audience courses; a `teacher`-type section (PLC/self-paced-PL sections made of teachers) can be assigned `student`- or `teacher`-audience courses; a `facilitator`-type section can be assigned any of the three. This is the mechanism behind, e.g., PD workshops running as ordinary `Section`/`Follower`/`UserScript` machinery with `participant_type: 'teacher'` instead of inventing a parallel roster system.

- **RegionalPartner** (`dashboard/app/models/regional_partner.rb:26,51-59`) — Code.org's own partner-org record (`has_many :program_managers`, `has_many :pd_workshops`). A `User` is tied to one via `RegionalPartnerProgramManager` (`dashboard/app/models/regional_partner_program_manager.rb`), a join row `{program_manager_id, regional_partner_id}` whose `after_create` callback does `program_manager.permission = UserPermission::PROGRAM_MANAGER` (line 22) and whose `after_destroy` revokes it if the user has no remaining partners (line 27) — granted purely by creating/destroying this join row, no separate flag. Unlocks: item 2/3's PROGRAM_MANAGER rules, scoped to `user.regional_partners`.
- **Facilitator — two unrelated senses, do not conflate them.** (1) `UserPermission::FACILITATOR` (item 2) is an *account-level* grant — a teacher-type user who runs/attends PD workshops as staff. (2) `Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator` / `PARTICIPANT_AUDIENCE.facilitator` (both string `"facilitator"`) are *course/section-level* audience labels from the axis explained above — a course whose `instructor_audience == 'facilitator'` can only be taught by someone holding the `FACILITATOR` permission (`course_types.rb`, `can_be_instructor?`), and a section whose `participant_type == 'facilitator'` holds facilitators-in-training as its "students." The permission is what a *user* holds; the audience constant is a property of *content* that happens to be checked against that same permission. They share a string value (`"facilitator"`) by convention, not by any shared model.
- **Workshop organizer vs. workshop admin** — CONFIRMED permission-only, no `Pd::WorkshopOrganizer` or similar class exists (`grep -rln "class.*WorkshopOrganizer\|class.*WorkshopAdmin" dashboard/app` → no hits). `WORKSHOP_ORGANIZER` and `WORKSHOP_ADMIN` are two of the ten `UserPermission::VALID_PERMISSIONS` (item 2/3); `dashboard/app/models/pd/` holds content models (`Workshop`, `Enrollment`, `Session`, `Application::*`) but no role model — all Pd:: gating runs through these `UserPermission` predicates via `Ability`.
- **Levelbuilder access — two independent gates, both required** (STRONGLY SUPPORTED): (1) the `UserPermission::LEVELBUILDER` flag on the user (`user.levelbuilder?`), and (2) the environment-level `Rails.application.config.levelbuilder_mode` flag, enforced at the controller layer:
  ```ruby
  protected def require_levelbuilder_mode
    require_english_in_levelbuilder_mode
    unless Rails.application.config.levelbuilder_mode
      raise CanCan::AccessDenied.new('Cannot create or modify levels from this environment.')
    end
  end
  ```
  (`dashboard/app/controllers/application_controller.rb:286-292`), mirrored in `ability.rb:484-486`. `config.levelbuilder_mode` is set per Rails environment, not per request:
  ```ruby
  # dashboard/config/environments/production.rb:69
  config.levelbuilder_mode = CDO.with_default(false).levelbuilder_mode
  # dashboard/config/environments/levelbuilder.rb:1,9
  require Rails.root.join('config/environments/staging')
  config.levelbuilder_mode = CDO.with_default(true).levelbuilder_mode
  ```
  **Levelbuilder curriculum-editing tools are not reachable on production studio.code.org.** `config/environments/production.rb` hardcodes the default to `false`; the only environment that defaults it `true` is the separate `levelbuilder` Rails environment (`RAILS_ENV=levelbuilder`), which itself `require`s and extends `staging.rb`, not `production.rb` — i.e. levelbuilder is its own deploy target built from the staging environment config, never the production one. STRONGLY SUPPORTED (upgraded from INFERRED) by `dashboard/lib/services/script_seed.rb`'s header comment, item 7: "We use serialization and seeding to synchronize curriculum data from Levelbuilder to other environments, most importantly production" — curriculum edits reach production only via this one-way seed/sync job, confirming production itself never runs as the levelbuilder environment. A levelbuilder-permission user visiting production can still hit the narrower read-only overrides scattered through `ability.rb` (e.g. `LEVELBUILDER`-gated visibility bypasses, item 2), but cannot `manage` (write) curriculum models there.
- **`project_validator`, `universal_instructor`, `student_work_access`** — see item 2 for grant/call-sites; item 6's instructor/participant axis above covers where `universal_instructor` acts as a course-audience bypass (`can_be_instructor?` returns `true` unconditionally for it).
- **`authorized_teacher`** — see item 2; comment claims it "prevents account from being locked" but no lockable/Devise-lock code referencing this permission was found in a targeted grep (AMBIGUOUS — may be stale comment or logic outside dashboard/app).
- **`verified_instructor?` / `verified_teacher?`** — STRONGLY SUPPORTED, `dashboard/app/models/concerns/user/verifiable.rb` in full:
  ```ruby
  def verified_teacher?
    permission?(UserPermission::AUTHORIZED_TEACHER)
  end

  INSTRUCTOR_ACCESS_PERMISSIONS = [
    UserPermission::UNIVERSAL_INSTRUCTOR,
    UserPermission::PLC_REVIEWER,
    UserPermission::FACILITATOR,
    UserPermission::AUTHORIZED_TEACHER,
    UserPermission::LEVELBUILDER
  ].freeze

  def verified_instructor?
    INSTRUCTOR_ACCESS_PERMISSIONS.any? {|required_permission| permission?(required_permission)}
  end
  ```
  `verified_teacher?` is narrower (only `AUTHORIZED_TEACHER`) and gates the AI-rubric feature (`Policies::Ai.ai_rubrics_enabled?`, item 7) plus "teacher markdown and level examples" per the `AUTHORIZED_TEACHER` comment (item 2). `verified_instructor?` is the union of five permissions and gates instructor-only content: Javabuilder/Javalab session tokens (`ability.rb:593-595`, quoted in item 3) and inline answer-key visibility (`Policies::InlineAnswer.visible_for_script_level?`, item 7, which also special-cases `script_level&.view_as_instructor_in_training?(user)` — see below).
- **`instructor_in_training`** — not a role; a per-`ScriptLevel` boolean authoring flag (`script_level.rb:135`). `view_as_instructor_in_training?(current_user)` (`script_level.rb:808-812`, comment: "about how to deliver a course. Those script_levels are marked as instructor_in_training"):
  ```ruby
  def view_as_instructor_in_training?(current_user)
    instructor_in_training && script.pl_course? && script.can_be_participant?(current_user)
  end
  ```
  It shows a PL-course *participant* (a teacher or facilitator taking professional-learning coursework — see the instructor/participant axis above) a special "how to teach this" view of a level, instead of the normal student-facing content, gated by `can_be_participant?` from the same audience mechanism. The e2e-tests cucumber feature directory of the same name exercises this exact view-toggle, not a distinct account role.
- **`Policies::DemoSections` / demo sections** — STRONGLY SUPPORTED. A "demo section" is a `Section` with a `demo_type` (`high`/`middle`/`elementary`, or `archived`) pre-populated with fixed preset curriculum and a fixed roster of "demo students" (`Policies::DemoSections::DEMO_TYPES`/`ALLTHETHINGS_UNIT_NAME`, `dashboard/lib/policies/demo_sections.rb:4-13`) — used so sales/teacher-preview demos always show the same canned content, and so demo-student accounts are excluded from ordinary teacher/peer-review views (`demo_student?`, referenced throughout `Ability`, e.g. item 3's `!Policies::DemoSections.demo_student?(u.id)` split). Creation authority: `POST /api/v1/sections/demo/create/:demo_type` (`api/v1/sections_controller.rb:98-100`, `def create_demo`) starts with `authorize! :create, Section` — the *ordinary* section-creation ability (item 3: any `teacher?` account), not a distinct elevated permission; any teacher can spin one up.
- **pairing** — NOT a role change. `PairingsController` (`dashboard/app/controllers/pairings_controller.rb`, read in full, 50 lines) stores which other students in the same section a signed-in student has selected to pair-program with, keyed in `session[:pairing_section_id]` and restricted to sections with `pairing_allowed` set (`selected_section_id`, lines 44-48) and to students in that section (excluding demo students, `sections_summary`, lines 30-40). It grants no new abilities and touches no `Ability`/`UserPermission` state — it's purely a session-scoped roster/UI preference for the paired-programming feature, not an authorization concept.
- **Plc:: peer review — who reviews whom** — `Plc::UserCourseEnrollment` (`dashboard/app/models/plc/user_course_enrollment.rb`) maps a teacher (a `User`, per the PLC README quote in item 6's earlier note: "we will use the existing User object") to a `Plc::Course` they're enrolled in. Peer review of that coursework is gated entirely by the `UserPermission::PLC_REVIEWER` permission (item 2/3: `can :manage, PeerReview`, `ability.rb:314-319`) — a `PLC_REVIEWER`-permission user reviews `PeerReview`/submission records tied to *any* enrolled teacher's PLC coursework; there is no separate reviewer-to-course or reviewer-to-teacher assignment model found (`grep -rn "class.*Reviewer" dashboard/app/models/plc` → no hits) — reviewing is a flat permission, not a scoped assignment. AMBIGUOUS: whether reviewer assignment is scoped in practice by a separate mechanism outside `dashboard/app/models` (e.g. an admin UI limiting which reviewer sees which submissions) was not confirmed in this pass.
- **`parent`** — INFERRED: not a real role/account type, and **no parent sign-in path exists**. No `Parent` model, no parent-facing controller or session type was found (`grep -rln "class Parent\b\|ParentsController\|parent_session" dashboard/app` → no hits). A parent's only touchpoint is the `ParentalPermissionRequest`/`parent_email` consent-link flow (item 8) — a one-time emailed link keyed by `uuid`, not an authenticated account. The `"parent"` value in `EDUCATOR_ROLES` (item 1) is a self-report label an adult can pick on *their own* `teacher`-type account profile (e.g. a homeschool parent registering as a teacher), unrelated to the child-consent flow.

## 7. `Policies::`, `Queries::`, and `Services::` classes

Located at `dashboard/lib/policies/`, `dashboard/lib/queries/`, `dashboard/lib/services/` (not `app/`). Counts: 14 policy files, 13 query files, 52 service files (`find dashboard/lib/{policies,queries,services} -name "*.rb" | wc -l` per namespace).

Each namespace's `README.md` states its convention in one sentence (all three READMEs share the same three-way split, quoted verbatim):
- **Policies** (`dashboard/lib/policies/README.md`): "POROs that encapsulate business logic which _tells you about something_."
- **Queries** (`dashboard/lib/queries/README.md`): "POROs that encapsulate business logic which _retrieves something_."
- **Services** (`dashboard/lib/services/README.md`): "POROs that encapsulate business logic which _does something_."

All three READMEs also state the same reuse rule: "should all be declared under the `Policies`/`Queries`/`Services` namespace and should contain non-Rails-specific business logic that can be used by our Rails app" — this is why they live in `lib/`, not `app/`.

**Misplaced-file check:** none found. Several domain nouns are deliberately split *across* all three namespaces per the stated convention rather than misplaced — e.g. `courses.rb` exists as `Policies::Courses` (tells you `modularity_enabled?`), `Queries::Courses`/`get_course_context`... referenced from `Services::Courses#canonical_path` (does the URL-rewrite) — and the same three-way pattern repeats for `lti` (`policies/lti.rb`, `queries/lti.rb`, `services/lti.rb` + `services/lti/*.rb`) and `level_files` (`policies/level_files.rb` decides the file path, `services/level_files.rb` writes/deletes the actual file). This is the pattern working as intended, not drift.

Policies:
- `active_record_roles.rb` — names of the DB roles (writing/reading/reporting) ActiveRecord connects as.
- `ai.rb` — feature-gates for AI rubrics / AI differentiation per user or unit/lesson.
- `child_account.rb` — Child Account Policy (COPPA-era) compliance/lockout rules — see item 8.
- `child_account/state_policies.rb` — per-US-state CAP policy table and lookup.
- `courses.rb` — `modularity_enabled?` flag check for course structure.
- `demo_sections.rb` — identifies/handles the shared "demo" sections and demo students used across teacher previews.
- `devise/email_domains.rb` — blocks sign-in for disallowed email domains.
- `inline_answer.rb` — visibility rules for instructor-only inline-answer content on levels/units.
- `level_files.rb` — file-path conventions for on-disk level definitions.
- `lti.rb` — LTI role/account-type interpretation (`lti_teacher?`, `unverified_teacher?`, etc.).
- `races.rb` — sanitizing/normalizing self-reported race data, URM determination.
- `script_activity.rb` — whether a user has completed a script / can view the congrats page.
- `unit.rb` — whether a `Unit` can be deleted.
- `user.rb` — misc user predicates: Google-verified-teacher candidacy, personal vs. school-managed account, US-country check.

Queries:
- `base.rb` — shared query-object base class.
- `child_account.rb` — read-side helpers for CAP compliance state.
- `courses.rb`, `lessons.rb` — curriculum read helpers.
- `lti.rb` — LTI-related reads.
- `school_info.rb`, `user_school_info.rb` — school/district lookups for a user.
- `script_activity.rb` — activity/progress reads.
- `user/dependent_students_count.rb`, `user/enabled_experiments.rb`, `user/expired_deleted_accounts.rb`, `user/inactive.rb`, `user/teacher_enabled_experiments.rb` — per-user reporting/reads named for what they return.

Services (52 files; role/permission-adjacent ones called out, rest grouped by theme):
- `base.rb` — shared service-object base class (`self.call(...) = new(...).call`, same pattern as `Queries::Base`).
- **`user/downgrade_to_student.rb`, `user/upgrade_to_teacher.rb`, `user/user_type_setter.rb`** — the actual mutators behind `user_type` transitions (item 1). `downgrade_to_student.rb`'s own comment: "Downgrades a teacher account to a student. This is a destructive action if the teacher has active sections. The UI hides the option when the teacher instructs a non-demo section, but use caution when running this service manually."
- `user.rb`, `user/upgrade_to_personal_login.rb`, `user/gender_normalizer.rb`, `user/multi_auth_migrator.rb`, `user/password_resetter_by_email.rb`, `user/password_resetter_by_username.rb`, `user/pii_scrubber.rb` — other per-user account-lifecycle mutations (form-param assignment, login-type migration, auth-provider consolidation, password reset, PII scrubbing on deletion).
- `child_account.rb`, `child_account/event_logger.rb`, `child_account/grace_period_handler.rb`, `child_account/lockout_handler.rb` — the CAP enforcement actions (item 8): starting a grace period, logging compliance events, running the lockout.
- `classlink/auth_id_generator.rb`, `classlink/v2_auth_option_builder.rb`, `clever/v3_auth_option_builder.rb` — SSO-roster auth-option migration/build helpers (Clever/ClassLink), relevant background for item 5's Clever `district_admin` collapse.
- `lti.rb`, `lti/account_linker.rb`, `lti/account_unlinker.rb`, `lti/auth_id_generator.rb`, `lti/deep_linking_response_builder.rb`, `lti/nrps_response_validator.rb` — LTI SSO account linking.
- `partial_registration/user_builder.rb` — builds a `User` from an in-progress signup.
- `afe_enrollment.rb`, `csta_enrollment.rb`, `complete_application_reminder.rb`, `registration_reminder.rb` — partner-program (Amazon Future Engineer, CSTA) enrollment submission and PD-application reminder emails, unrelated to authorization.
- `courses.rb`, `unit_group_creator.rb`, `script_seed.rb`, `deprecated_level_loader.rb`, `curriculum_pdfs.rb` (+ `curriculum_pdfs/lesson_plans.rb`, `resources.rb`, `script_overview.rb`, `utils.rb`), `level_files.rb`, `markdown_preprocessor.rb`, `i18n/curriculum_sync_utils.rb` — curriculum authoring/build/sync plumbing, not roles. `script_seed.rb`'s header comment is the confirming evidence for item 6's levelbuilder-production split: "We use serialization and seeding to synchronize curriculum data from Levelbuilder to other environments, most importantly production" — i.e. levelbuilder curriculum edits reach production only through this one-way seed/sync pipeline, never by production itself running in levelbuilder mode (upgrades that item-6 claim from INFERRED to STRONGLY SUPPORTED).
- `database_connections.rb` — reader/writer DB-connection routing for controllers (`use_reader_connection_for_route`); infra concern, pairs with `Policies::ActiveRecordRoles` (item 7) rather than duplicating it.
- `contentful_notification_formatter.rb`, `globally_unique_identifiers.rb`, `international_opt_in/partner_data_loader.rb` — misc content/formatting helpers unrelated to roles.

## 8. Age / COPPA gating

STRONGLY SUPPORTED — core age computation, `dashboard/app/models/concerns/user/age.rb` in full relevant part:

```ruby
def age
  return @age unless birthday
  age = UserHelpers.age_from_birthday(birthday)
  if age < 4
    age = nil
  elsif age >= 21
    age = '21+'
  end
  age
end

# Duplicated by under_13? in auth_helpers.rb, which doesn't use the rails model.
def under_13?
  age.nil? || age.to_i < 13
end
```

Direct capability gating on `under_13?`, `dashboard/app/models/user.rb`:
- `update_default_share_setting` (line 1273-1277): `self.sharing_disabled = true if under_13?` — advanced-project sharing is off by default for under-13 accounts on creation.
- `update_share_setting` (line 1280-1285): if the student isn't in any section, `self.sharing_disabled = under_13?`.
- `no_personal_email?` (line 1212-1214): `under_13? || (hashed_email.blank? && email.blank? && parent_email.present?)`.

Parent representation: `parent_email` is a plain string column on the student's own `User` row (`user.rb:8`, index at line 67), not a separate account/model. Related predicates in `user.rb`: `parent_managed_account?` (line 1194: `student? && parent_email.present? && hashed_email.blank?`), `parent_created_account?` (line 1199-1200), `can_add_parent_email?` (line 1206-1210). `User.where(parent_email: email)` (line 1509) is how "child accounts" are looked up for a given parent email — confirms a parent is identified only by matching this string, never by a `Parent` record.

Dedicated compliance object: `Policies::ChildAccount` (`dashboard/lib/policies/child_account.rb`, read in full). Key public methods, quoted:

```ruby
# Is this user compliant with our Child Account Policy(cap)?
# For students under-13, in Colorado, with a personal email login: we require
# parent permission before the student can start using their account.
def self.compliant?(user, future: false)
  return true unless parent_permission_required?(user, future: future)
  ComplianceState.permission_granted?(user)
end

def self.parent_permission_required?(user, future: false)
  return false unless user.student?
  policy = StatePolicies.state_policy(user)
  return false unless policy
  return false if !future && policy[:lockout_date] > DateTime.now
  return false unless underage?(user)
  Policies::User.personal_account?(user)
end

def self.can_link_new_personal_account?(user)
  return true unless user.student?
  return false unless has_required_information?(user)
  return true unless Policies::User.in_usa?(user.country_code)
  return true unless underage?(user)
  ComplianceState.permission_granted?(user)
end
```

`ComplianceState` (nested module) maps the `users.cap_status` column to three states — `GRACE_PERIOD`, `LOCKED_OUT`, `PERMISSION_GRANTED` — via dynamically defined `grace_period?`/`locked_out?`/`permission_granted?(student)` predicates comparing `student.cap_status` to each value.

Enforcement at the controller layer, `dashboard/app/controllers/application_controller.rb:382-385`:
```ruby
Services::ChildAccount::GracePeriodHandler.call(user: current_user)
return unless Services::ChildAccount::LockoutHandler.call(user: current_user)
```
and `sessions_controller.rb:90`: `return redirect_to home_path unless Policies::ChildAccount::ComplianceState.locked_out?(current_user)` (the parent-permission-request/lockout flow page redirects away unless the account is actually locked out).

So a student's age changes capability along three concrete axes: (1) default project-sharing is disabled under 13 regardless of state; (2) in US states with a live Child Account Policy (looked up per-state via `StatePolicies.state_policy`), a personal-login student under that policy's max age (`underage?`) cannot link/keep a personal login, and their session is fully locked out (redirected via `LockoutHandler`) until a parent grants permission (`cap_status == PERMISSION_GRANTED`); (3) parent-recovery email (`parent_email`) is the only mechanism for a young/no-personal-email student to have an account-recovery contact at all.

INFERRED: I did not find an explicit "hard block under age N regardless of state" — the whole mechanism is state-policy-driven (`StatePolicies.state_policy(user)` returns `nil` outside a covered state, which short-circuits every gate above to non-restrictive).

## 9. `admin?`

STRONGLY SUPPORTED. `admin` is a plain boolean column on `users` (`user.rb:23`); `admin?` is the default ActiveRecord boolean predicate — no custom override exists (`grep -n "def admin\b" user.rb` → no hits). It is validated, not merely declared:

```ruby
def admins_must_be_teachers_without_followeds
  if admin
    errors.add(:admin, 'must be a teacher') unless teacher?
    errors.add(:admin, 'cannot be a followed') unless sections_as_student.empty?
  end
end

def enforce_google_sso_for_admin
  return unless admin
  errors.add(:admin, 'must be a migrated user') unless migrated?
  return if rack_env?(:development, :adhoc)
  unless (authentication_options.count == 1) && (authentication_options.all? {|ao| ao.google? && ao.codeorg_email?})
    errors.add(:admin, 'must be a code.org account with only google oauth')
  end
end
```
(`user.rb:558-563, 630-641`) — an admin must be a teacher-type account, never a followed/student, and (outside dev/adhoc) authenticated solely via Google OAuth on a `@code.org` email. In `Ability`, `user.admin?` grants `can :manage, :all` with an explicit curriculum-model carve-out (item 3) — this is unambiguously "Code.org staff admin," gated at the infrastructure level (only `@code.org` Google accounts can hold it), and is entirely distinct from:
- a **section owner** (`Section#user_id`/`teacher`, item 4) — authority over one section only, any teacher account;
- a **"district admin"** — no such role/model exists in code at all (item 1/5).

## DB observations (OBSERVED, local dev database, read-only)

```
user_type counts:      {"teacher"=>137, "student"=>202}
admin count:           0
permission counts:     {"levelbuilder"=>1, "workshop_organizer"=>6, "facilitator"=>6, "authorized_teacher"=>3}
section_instructor status counts: {"active"=>108}
```

Confirms: only `teacher`/`student` values exist in the local `users.user_type` column; no local user has `admin: true`; the only `UserPermission` rows present locally are `levelbuilder`, `workshop_organizer`, `facilitator`, `authorized_teacher` (none of `project_validator`, `plc_reviewer`, `program_manager`, `universal_instructor`, `student_work_access`, `workshop_admin` are seeded locally); all 108 local `section_instructors` rows are `status: active` (no `invited`/`declined`/`removed` rows in this dataset).
