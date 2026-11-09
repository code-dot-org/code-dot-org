# User Model Improvement Report — July 2026

Prepared from: the five historical docs in this directory, a trace of the current
code on `staging`, a blast-radius sweep of the monorepo, and a survey of the
published record at GitLab, Shopify, GitHub, 37signals, and Gusto. Constraint
taken as hard: zero user-visible impact.

## Verdict

The user model is in better shape than the historical docs suggest, and the
work already in flight is the right work. The docs describe a 3,000-line file
with four candidate proposals; the code today shows proposals 2, 3, and 4
partially or fully executed, and user.rb down 27% from its peak. The sprawl
that remains is not a line-count problem. It is three distinct problems that
the line-count framing hides:

1. **A dual data model.** Every user is still created single-auth and
   converted by an `after_create` callback. 37 `migrated?` call sites across
   13 files keep both account shapes alive.
2. **Schema debt.** 51 serialized attributes in one `properties` text column,
   including Devise lockable state (`failed_attempts`, `locked_at`), OAuth
   tokens, and legal-compliance records — unindexable, unqueryable, invisible
   to the database.
3. **A coupling hub.** 322 files reference User (129 controllers), 41
   associations, 24 mixins. This is the part no tool fixes; the published
   record says you cap it, you don't shrink it away.

Rails engines and packwerk address none of these. They police constant
references between files; a god model is one constant that every package
would reference. Recommendation: do not adopt either now (detail below).

## Current state, measured (corrects the 2024–2025 docs)

| Metric | Docs said | Code says (2026-07) |
|---|---|---|
| user.rb lines | ~3,000 | 2,154 (peak 2,931 in Sep 2024) |
| Methods | 200+ | 141 defs |
| Columns | 47 | 54 (per schema annotation) |
| Serialized attrs | ~50 | 51 + 16 attr_accessors |
| Associations | 29 | 41 |
| Mixins | — | 24 (16 in `concerns/user/`) |
| Callbacks | "many, scattered" | 18, grouped in one section |
| Referencing files | — | 322 (`User.`/`current_user`) |
| Dedicated test | — | user_test.rb, 4,896 lines |

Status of the four proposals from the User Model Improvement Proposal:

- **1. Multi-auth from the start — NOT done.** `after_create
  :migrate_to_multi_auth` (user.rb:484) still fires on every create. A
  DCDO-gated `Services::User::MultiAuthMigrator` exists, so a strangler
  replacement of the legacy helper is in flight, but it still runs post-create;
  users are still born single-auth. The legacy auth fields remain — two
  real columns (`provider`, `uid`) plus three serialized `oauth_*` keys in
  the properties blob — and `provider` triple-duties as data, migration flag
  (`'migrated'`), and account-kind flag (`'sponsored'`/`'manual'`).
- **2. Reorder user.rb — done.** Macros are grouped (associations →
  validations → callbacks) with section comments.
- **3. Policies/Services/Queries + Concerns — actively working.** 16 trait
  concerns in `app/models/concerns/user/`, `Policies::User`,
  9 `Services::User::*`, 5 `Queries::User::*`. This is what removed ~780
  lines since the 2024 peak.
- **4. STI — landed, but hollow.** `self.inheritance_column = :user_type`
  with `Teacher`/`Student` subclasses (PR #64959; reverted once, re-landed as
  #65457). The subclasses are 94 and 80 lines, nearly all schema annotation;
  ~7 call sites use them (mostly as query scopes: `Teacher.all`,
  `Student.find_by`). An `StiFactory` shim keeps `User.new(user_type:)`
  working, and `with_type` uses `becomes()` for type changes.

## Opinion: what the sprawl actually is

**The dual auth model is the most expensive residue.** It is the root cause
named in every historical doc (duplicate auth options back six years, broken
password reset, "two user models") and it taxes every other refactor: any
change to auth code must be reasoned about twice. The industry norm —
OmniAuth identities pattern, Rails 8's generator, GitLab's `has_many
:identities` — is that credential rows exist from creation. Structural
writes in `after_create` are the canonical callback smell (CodeClimate,
37signals both flag callbacks first).

**The properties blob is a data-model problem wearing a code-organization
costume.** 51 attributes in one serialized column spanning at least four
unrelated domains: UI flags (`has_seen_homepage_welcome`,
`donor_teacher_banner_dismissed`), compliance records
(`data_transfer_agreement_*`), auth/security state (`failed_attempts`,
`locked_at`, OAuth tokens), and role data (`educator_role`,
`grades_teaching`). Devise lockable state in an unindexed JSON blob deserves
its own line item: brute-force lockout state that the database cannot query.
This is GitLab's wide-users-table problem verbatim; their fix
(`user_details` table, multi-release read-fallback backfill, `delegate` so
the Ruby API never changes) is a proven zero-impact play.

**The remaining 141 methods are a junk drawer of predicates.** What's left in
user.rb after the extractions: school-info handling, credential management,
section/progress accessors, and ~30 `can_*` / `*_managed_account?` /
`should_see_*` predicates — policy questions living on the model while
`Policies::User` is only 79 lines and ability.rb is 613. Authorization is
split three ways (model predicates, Policies::, CanCanCan) which is the
"divergent AuthZ" pain point the docs name.

**Assorted smells, minor but telling:** `include
Rails.application.routes.url_helpers` in a model; `Rails.application` config
reads inside validations; `user_type` conflated with `educator_role`.

**What's genuinely fine:** the file is organized; the test harness is a real
asset (4,896-line characterization suite); DCDO flags are an established
house pattern for ramped rollout; the PSQ layering matches GitLab's
services/finders/policies discipline. The trend line is good.

One sober calibration from the published record: GitLab has had this exact
layered discipline for a decade and their user.rb is still ~3,500 lines.
For a hub entity, "cap and contain" is the realistic end state. The goal is
a boring user.rb — persistence, associations, trait façades — not a small
one. Nobody in the public record has decomposed a User/Shop god model to
nothing; Shopify's stated goal is instead that the god class "can depend on
almost nothing."

## On Rails engines and packwerk

Short answer: wrong tools for this problem; possibly useful later in a
narrow, cheaper form.

- Both tools police constant references between files. Every package/engine
  in the app would reference `User`; drawing a boundary around the model
  either exposes everything (no boundary) or requires inverting hundreds of
  dependencies first. Shopify's own answer to their god object (Shop) was
  class-level dependency inversion plus strangler-fig extraction — not
  packaging.
- Shopify's Packwerk retrospective (2024): dependency checks earned their
  keep; privacy checks were removed in Packwerk 3.0 as a failure ("technical
  debt… still a long way from being paid off"); packwerk-clean packages
  still wouldn't boot in isolation. Gusto: a zero-violation package passed
  ~40% of its tests when actually extracted — hidden coupling via test
  helpers, config, metaprogramming.
- GitLab evaluated this space for their modular-monolith program and chose
  plain Ruby namespaces enforced by RuboCop over both engines and packwerk.
- The three engines already in `dashboard/engines/` (contentful, hoc_legacy,
  observability) are leaf features. That's what engines are for. User is
  the opposite of a leaf.

If, after further extraction, the team wants to fence `Policies::` /
`Queries::` / `Services::` against re-entanglement, the evidence-supported
version is dependency-checks-only packwerk or GitLab-style RuboCop namespace
rules — the latter is much cheaper and this repo already runs RuboCop in
pre-commit.

## On STI (since it already shipped)

The published evidence is uniformly against pushing further logic into the
Student/Teacher subclasses, for one structural reason: Code.org users change
type at runtime. `Services::User::UpgradeToTeacher` and
`DowngradeToStudent` exist precisely because of it, and type change is STI's
canonical failure mode (thoughtbot's Ruby Science: `becomes()` recreation,
stale in-memory identity, stale caches and associations). Devise+STI also
has documented mapping/`current_user`/autoload breakage, and this STI landed
with a revert already in its history.

Recommended posture: freeze it where it is. Keep the subclasses as query
conveniences (`Teacher.all` reads well) and the StiFactory shim as
compatibility. Do not move validations or behavior into the subclasses.
Where teacher-only state grows, prefer a profile/detail table
(`teacher_profiles`) or role objects — Basecamp expresses "kind of user" as
a per-account role object; GitLab uses a `user_type` column plus a concern,
not subclasses.

## Recommendations, ranked

Each ships independently, each has an oracle, none is user-visible.

*(Ordering revised after the adversarial review — see Addendum 1. The
review's strongest correction: sequence by risk, and stage the dual-auth
work as code-first, backfill-last. Item 1 added after the write-surface
discussion — see Addendum 2; it is the organizing frame for items 2–5.)*

**0. Fix the verified defects first.** Independent of any refactor; each is
small and shippable now (details in Addendum 1): the audit-log bypass in
`revoke_all_permissions` (A2), the nil-deref / wrong-record write in
`save_email_reg_partner_preference` (A4), and deleting the DCDO-selected
duplicate multi-auth migrator whose two implementations diverge (A3).

**1. Define the write API: route User mutations through named commands.**
Measured surface today: 46 `update`/`save` call sites across 10
controllers, 26 raw attribute writes (`current_user.has_seen_* = ...` in
api/v1/users_controller), and mass-assignment permit lists in
registrations_controller that include `user_type` itself — so "student
becomes teacher" exists in the domain but not in the code; it is an
emergent property of a permit list plus the 18-callback chain
(`fix_by_user_type` PII-blanking and StudioPerson destroy/create included).
That unbounded write surface is why side effects cannot be monitored or
audited (finding A2 is a specimen). Remedy, all zero-user-impact:
- Route writes through named `Services::User::*` commands —
  `UpgradeToTeacher`, `PasswordResetterByEmail` etc. already establish the
  house pattern; make it the only door, one controller at a time, as pure
  mechanical delegation first. A single `UpdatePreferences` command with an
  allowlist absorbs ~20 of the 26 raw setters (all serialized-blob UI
  flags).
- Enforce with the RuboCop responsibility cop (item 6): forbid
  `.update`/`.save`/attribute writes on User outside `Services::User`.
- Instrument the commands: ~15 named operations become the choke point for
  audit logging, metrics, and event emission — "monitor side effects"
  becomes tractable by construction.
This reframes the program: the unit of improvement is not a smaller file
but a defined write API. The file split (and later callback retirement,
item 5) follow naturally because behavior has a named place to go.

**2. Consolidate policy predicates into `Policies::User`.** Moved ahead of
callback work: high value, low risk, pure reads. The ~30 predicates
(`can_*`, `*_managed_account?`, `should_see_*`) move next to
`Policies::User.personal_account?`, ability.rb consumes policies, and the
verified duplication between `User#providers` and
`Policies::User.personal_account?` dies with it. Scientist-style parallel
comparison where any predicate feels risky.

**3. Retire the dual auth model — staged code-first, backfill-last.**
Still the top structural item, but not one "finish the migration" push:
- Kill dead/duplicate code now: the DCDO-gated `MultiAuthMigrator` dual
  path (A3). `demigrate_from_multi_auth` has test-only references; it stays
  as the backfill rollback tool until the backfill is verified, then dies.
- Collapse `email`/`hashed_email` to one source of truth (A1) — today the
  getters read from `primary_contact_info` for migrated users while
  `normalize_email`/`hash_email` and `find_for_authentication` still write
  and query the shadow columns.
- Create the `AuthenticationOption` at initialization time (the LTI flow in
  `lib/services/lti.rb:13` already does this). Only ~10 `User.new` sites
  exist; funnel them through one construction service. Retire
  `after_create :migrate_to_multi_auth` behind a DCDO ramp with a
  consistency oracle (users where `provider != 'migrated'` post-create
  must be zero).
- Last, the production backfill (in_batches), then delete the 37
  `migrated?` branches, the two legacy columns (`provider`, `uid`), and the
  three serialized oauth keys. The backfill is where the risk lives;
  everything before it is reversible code cleanup.

**4. Promote behavioral keys out of the properties blob; leave inert flags.**
Narrowed from "split it all" after the review: the blob's defect is not
size but that load-bearing state hides in it, and that the `before_save`
compaction (`properties.select! {|_, v| v.present?}`) silently drops
explicit `false`/`0` — no tri-state flag can be stored. Promote:
`failed_attempts`/`locked_at` → real columns (Devise lockable works today
only via a `Lockable.prepend(CustomLockable)` monkeypatch in an
initializer); OAuth tokens → `AuthenticationOption` (dies with item 2);
compliance records (`data_transfer_agreement_*`) → their own table;
`educator_role`/`grades_teaching` → columns. Leave never-queried UI
dismissal flags in JSON. Mechanism per key: new storage → dual write →
backfill → switch reads → delegate. Multi-release, boring, proven.

**5. Callbacks last, behind pins.** The callback chain is where the latent
correctness bugs live (`# NOTE: Order is important here`; `fix_by_user_type`
doing four things including destructive `StudioPerson` writes mid-save), so
it goes last, behind characterization tests: each callback becomes an
explicit step inside the relevant write command from item 1 (secret
pictures/words, share settings, PD enrollment, LTI linkage move into the
construction command; the rest into their mutation commands). Drop `Rails.application.routes.url_helpers` from the model
as callers are extracted. End state for user.rb: persistence +
associations + validations + trait façades delegating to POROs.

**6. Hold the line with cheap tooling, not engines.** Two RuboCop rules
(house pattern already): the write cop from item 1 (no User mutations
outside `Services::User`), and a responsibility cop forbidding new
`can_*`/`*_managed_account?` predicates on the model. A file-length cop is
optional garnish — length polices symptoms, these police causes. Revisit
dependency-checks-only packwerk only if namespace discipline demonstrably
erodes.

**7. Do not** build toward STI-subclass behavior, engines around User, a user
microservice, or a new datastore. Every published analog of the
extract-to-service path for a hub entity either stalled or succeeded only
as "narrow slice with an oracle" — which is what items 1–3 are, in-process.

## Zero-user-impact toolkit (all precedented)

- **Pinning/characterization tests** (GitLab refactoring guide): snapshot
  current behavior including bugs; three-commit protocol (add pins /
  refactor / remove pins). The existing user_test.rb is most of this.
- **Scientist-style parallel run** (GitHub): old and new implementations on
  live traffic, always return old, compare and ramp. Read paths only —
  permissions, role predicates, progress reads. GitHub ran a multi-year
  permissions rewrite this way with no user-visible effects.
- **Strangler fig for state** (Shopify's 7-step recipe): new interface →
  redirect callers → new table → dual write → backfill → switch reads →
  delete. Each step reversible.
- **Delegation** (GitLab/37signals): public API stays on User, internals
  move. Zero visible impact by construction.
- **DCDO ramped flags**: already the house pattern; MultiAuthMigrator is
  gated this way today.

## Addendum 1: adversarial review and response (2026-07-06)

An independent adversarial review (Opus, clean-code lens) was run against
the model code and this report's five conclusions. Its top findings were
spot-verified against source before acceptance. Summary and disposition:

### Verified defects (checked against source, accepted)

| # | Finding | Location | Severity |
|---|---|---|---|
| A1 | `email`/`hashed_email` have two sources of truth: getters read `primary_contact_info` when `migrated?`, but `normalize_email`/`hash_email` write the columns and `find_for_authentication` queries the columns. Mutating a migrated user's AO email without re-saving the User leaves the login-lookup column stale. | user.rb:570-578, 608-616, 1989-1994 | high |
| A2 | `revoke_all_permissions` uses `update_column(:admin, nil)`, skipping the `before_save :log_admin_save` audit hook — admin grants are logged to infra-security, revocations are not. | user_permission_grantee.rb:44 | high |
| A3 | Two multi-auth migrators selected by DCDO flag are not behaviorally identical: the service creates an EMAIL option on `email.present? \|\| hashed_email.present?` and sets Clever `version`; the inline path keys only on `hashed_email.present?` and never sets `version`. A flag toggle changes persistence semantics. | user_multi_auth_helper.rb:85-133 vs services/user/multi_auth_migrator.rb | high |
| A4 | `save_email_reg_partner_preference` (an `after_save`) re-fetches `User.find_by_email_or_hashed_email(email)` instead of using `self` — nil-deref if lookup misses, wrong-record write if it hits another account. | concerns/user/email_preferences.rb:54-60 | high |
| A5 | Devise lockable works only via `Devise::Models::Lockable.prepend(CustomLockable)` in an initializer, because `failed_attempts`/`locked_at` are serialized properties, not columns. Nothing at the `devise :lockable` include site signals this; a Devise upgrade breaks lockout silently. Compounding: the `before_save` property compaction drops any value that is not `present?`, so explicit `false`/`0` cannot be stored in the blob at all. | config/initializers/devise.rb:378, serialized_properties.rb:13 | med |
| A7 | STI type change is inconsistent: omniauth/new_with_session paths use `becomes!`, but `UpgradeToTeacher`/`DowngradeToStudent` mutate `user_type` without it — in-memory class ≠ `user_type` until reload. | services/user/upgrade_to_teacher.rb:17 | med |

Additional accepted medium/low findings: `fix_by_user_type` is a
four-responsibility `before_save` with destructive `StudioPerson` writes
and an explicit "Order is important" comment (temporal coupling);
ability.rb is a ~600-line initialize duplicating model role logic;
a "TODO (@eric, before merge!)" comment shipped in `find_for_authentication`;
`sections` aliases `sections_instructed` (name means its opposite);
`provider` is a five-way discriminated union in one string column.

### Tempered or rejected

- `valid_password?` writing `encrypted_password` (A8): verified, but this
  is the standard rehash-on-login pattern for the pepper migration —
  intentional, industry-common. A CQS violation worth a comment, not a
  defect queue entry.
- The reviewer itself killed two of its own findings on verification
  (stale `@permissions` after `becomes!`; a claimed bad INSERT in
  `from_omniauth`), which raises confidence in the survivors.

### Review's challenges to this report, and disposition

- **"Callbacks first" reversed → accepted.** The review argued the
  predicate consolidation is high-value/low-risk while callbacks are where
  latent correctness bugs live, so callbacks should go last behind pins.
  Correct; recommendations reordered accordingly.
- **Blob split narrowed → accepted.** Most of the 51 keys are inert
  write-once UI flags; wholesale table-splitting is ceremony. The real
  defect is behavioral keys hiding in the blob (A5) plus the `present?`
  compaction. Recommendation narrowed to promoting typed/behavioral keys
  only.
- **Dual-auth "finish it" reframed → accepted.** The risk lives in the
  data backfill, not the code; the code divergences (A1, A3) are the
  clean-code cost and are closable now. Recommendation restaged
  code-first, backfill-last.
- **STI freeze → upheld, with one addition.** The review agreed
  (`user_type` is mutable state, not a subtype) and added: fix the
  `becomes!`-less upgrade path so the few existing STI consumers stay
  consistent. Added.
- **RuboCop line-holding → upheld, sharpened.** Size cops police length,
  not responsibility; pair with a targeted cop banning new `can_*` /
  `*_managed_account?` predicates on User. Accepted.

### Test suite verdict (review, sampled)

user_test.rb (4,896 lines, 348 tests) is more characterization asset than
liability: zero private-method pokes, exercises the public surface. Two
fixable liabilities: shared mutable `setup_all` fixtures (`@good_data`,
referenced 28×) invite order-dependence, and absolute `Timecop.travel`
dates (2013/2017/2018). Freeze or rebuild fixtures per-test; use relative
offsets. Not a rewrite target — which matters, because this suite is the
pinning harness the whole plan leans on.

## Addendum 2: the write surface, and a readability concession (2026-07-06)

Post-review discussion raised two challenges to this report. Both changed
it.

**Readability.** The original verdict ("cap and contain; boring, not
small") under-weighted file readability as a goal in its own right. Amended
position: user.rb should keep shrinking toward a file that reads in one
sitting (~500-600 lines: schema, associations, validations, macro wiring,
trait façades) — with the discipline that each extraction is a cohesive
trait delegating to a PORO, since splitting alone scatters behavior. The
review found 4 of the 16 existing concerns are drawers, not traits
(`AssignedCoursesAndScripts`, `AiAccessible`, `SectionParticipation`,
partially `UserPermissionGrantee`). The readability test that matters is
not file length but "what happens when a user is saved?" — today that
answer spans 18 callbacks, the serialized-properties compaction, and a
Devise monkeypatch across five files. Fewer implicit behaviors is what
buys understanding; shorter files follow from it.

**The write surface (the sharper problem).** Measured: 46 `update`/`save`
call sites across 10 controllers, 26 raw attribute setters on
`current_user`/`@user` in controllers, and permit lists that mass-assign
`user_type`. Consequences: any controller write fires the full callback
chain; domain operations ("student becomes teacher") have no name in the
code, so they cannot be audited, instrumented, or reasoned about; the A2
audit gap is a specimen, not an outlier. This became recommendation 1
(define the write API) and reframed the program: mutations behind ~15
named `Services::User::*` commands, enforced by cop, instrumented at the
command layer. File size and callback retirement are downstream of it.

## Sources

Internal: the five docs in this directory; `dashboard/app/models/user.rb`
(2,154 lines as of 513932bef33); PRs #62984, #63566, #64959, #65457;
`lib/user_multi_auth_helper.rb`; `lib/services/user/multi_auth_migrator.rb`.

External: GitLab user.rb, reusing-abstractions / policies / refactoring /
layout-and-access-patterns docs, issues #51191 #206913 #359080,
bounded-contexts blueprint; Shopify "Under Deconstruction", "Strangler Fig",
"Packwerk Retrospective" (railsatscale.com, 2024-01); Gusto gradual
modularization posts; Hagemann on packwerk's two modes; github/scientist +
"Move Fast and Fix Things"; 37signals "Vanilla Rails is plenty" + "Good
concerns"; CodeClimate "7 Patterns to Refactor Fat ActiveRecord Models";
thoughtbot Ruby Science on STI; Rails delegated_type API docs; OmniAuth
wiki on multiple providers.
