# Open questions

Everything phase 1 could not resolve, with why it matters. The per-item
questions are also attached to their `inventory.yaml` items (69 of them);
this file collects the ones that will change how a domain gets documented, or
that a doc owner cannot write around.

Ordered by consequence, not by area.

## Blocking: a doc owner cannot write the page without an answer

### 1. What do we say about the district administrator role?

The product names three end-user roles. The code has two. There is no
`district_admin` user type, no `UserPermission`, no district-scoped read
model, and no district dashboard. Clever's `district_admin` and `school_admin`
sign-ins are collapsed to plain `teacher` at
`dashboard/app/models/user.rb:1670-1672`. `educator_role` accepts the value
`district_admin` and no authorization code anywhere reads it (exhaustive grep,
zero hits).

Why it matters: whoever owns the district-administrator domain has either
nothing to document, or a page whose subject is "this is not supported, here
is what stands in for it" — the LTI integration setup, principal approval
forms, census reporting, and asking staff or a regional partner. That is a
product decision, not a research one. It should be made before a domain is
assigned.

Anchors: `roles-and-permissions.md` sections 1, 2, 5; `journeys.md` journey 16;
`inventory.yaml` `district-admin-role-gap`.

### 2. Which of the duplicated frontend implementations serves production?

Two features exist twice, once under `apps/src` and once under
`frontend/packages`: Music Lab (`apps/src/music` vs
`frontend/packages/labs/music`) and localization (`apps/src/localization` vs
`frontend/packages/core/src/plugins/localization`). Simplified sign-up is a
third case: `apps/src/simpleSignUp` sits beside `apps/src/signUpFlow` with no
flag found that chooses between them.

Why it matters: documenting the wrong one is worse than documenting neither.
Every affected domain needs to know which tree is live.

### 3. What is the exact visibility matrix for `published_state`?

`PUBLISHED_STATE` has seven values (in_development, pilot, beta, preview,
stable, sunsetting, deprecated). `Unit#has_pilot_access?` and
`UnitGroup#has_pilot_access?` gate unpublished content, and
`UserPermission::LEVELBUILDER` bypasses the gate. Nowhere in the repo is the
full state-by-role matrix written down.

Why it matters: the curriculum domain's central page is "who can see this
course". It cannot be written from the constants alone.

### 4. Is the skills dashboard shipped?

`DCDO skills-dashboard` exists, `SkillsController` exists, `/skills` routes
exist, and the entry-points sweep found the nav item unreachable even with the
flag on.

Why it matters: it is either a documented feature, an undocumented one, or
dead code to be deleted. Three very different outcomes.

### 5. What is Chatter?

`GET /chatter/index` is declared before the main host-constraint block,
`ChatterController` has no auth filters that a grep found, and there is a
`chatter_helper.rb`. No test, no doc, no flag.

Why it matters: an unauthenticated AI-adjacent endpoint that nobody can
describe is either a product feature missing from every inventory, or a
security question.

## Correctness and safety questions raised by the sweep

### 6. Should `Api::V1::TestLogsController` be reachable in production?

Every other test-support route is wrapped in `if rack_env?(:development,
:test)` or `if rack_env?(:staging, :test)`. `test_logs` sits outside both
guards and is reachable in every environment, production included.

### 7. What protects an unlisted project channel id?

`ProjectsController` excludes `load`, `create_new`, `show`, `edit`,
`readonly`, `export_config`, `submission_status` and others from
`authenticate_user!`. Loading and editing a project by channel id needs no
session. The channel id's unguessability appears to be the whole protection.
Documenting sharing without stating this plainly would be misleading.

### 8. Why does `AichatRequestsController` have no `authenticate_user!`?

It has one `before_action :reassign_model_customizations` and nothing else at
the controller level. AI Chat requests cost money and touch a provider.

### 9. Why does `sections#archive_all` skip CSRF verification?

`skip_before_action :verify_authenticity_token, only: [:archive_all]` on a
destructive bulk action.

### 10. What limits the media, XHR and redirect proxies?

`GET /media`, `GET /xhr` and `GET /redirected_url` let student code fetch
arbitrary URLs through our own origin. No rate limit or allowlist was found in
this pass.

### 11. Can a teacher with sections be downgraded to a student?

The UI gate is `sections_instructed`; the endpoint itself accepts the change
and orphans the section (probed previously). Either a bug to file or a
behavior to document.

## Ambiguities in the platform that affect several domains

### 12. Sentry or Honeybadger?

Both are fully configured: Sentry gems in the observability engine's gemspec,
`gem 'honeybadger'` in the main Gemfile plus `dashboard/config/honeybadger.yml`.
Which is authoritative for error reporting was not resolved. Every
developer-doc domain that says "report the error" needs the answer.

### 13. What does Poste2 relay through?

`Poste2::DeliveryMethod` is the ActionMailer delivery method in production,
staging and development. It lives in `lib/cdo/poste/`. What it hands off to
downstream — an SMTP relay, another vendor — was not traced. Mailjet is used
only for PD workshop mail.

### 14. Where is the translation-sync pipeline?

No Crowdin config, rake task, or any other translator round-trip mechanism
exists in the repo. The i18n domain can document the locale file layout and
the fallback chain, and cannot document how a string reaches a translator.
Separately, CODEOWNERS assigns `/bin/i18n/` to the i18n team and that path
does not exist; the real root config is `config/i18n`.

### 15. Where do background workers run, and where is cron defined?

No `Procfile`, no `whenever` gem. `lib/cron/` holds exactly one file. Job
scheduling is presumably in `cookbooks/` or a k8s cronjob; unconfirmed.

### 16. What is the current production traffic split, Chef versus k8s?

`cookbooks/` is authoritative for production today and the k8s and Kargo path
is actively developed. `docker/README.md` opens by warning it is early-stage.
The deploy domain needs a current statement rather than an inherited one.

### 17. Does `app_options` still apply to lab2 labs?

`levels_helper.rb:259` carries the comment "Backpack is used in lab2 apps also
but app_options is only used by legacy labs", which implies lab2 has a
parallel bootstrap contract that this pass did not investigate. The labs
runtime page needs both contracts or it will be wrong for half the labs.

### 18. Which TTS backend is current, Acapela or Azure?

`dashboard/lib/acapela.rb` and `dashboard/app/controllers/concerns/azure_text_to_speech.rb`
both exist, with `Gatekeeper azure_speech_service` and a DCDO
`updated_tts_path` suggesting a migration in progress.

### 19. Which Blockly renderer is the production default?

`geras` and `zelos` are both experiment names. Both are Blockly renderers.

## Smaller unresolved items, grouped

### Curriculum and levelbuilder

- How does a teacher earn `AUTHORIZED_TEACHER` in production — PLC enrollment,
  workshop attendance, or a manual grant?
- `PLC_REVIEWER` is a flat permission with no reviewer-assignment scoping model
  found. How are reviewers matched to submissions?
- What still lives behind `curriculum_proxy_controller` and is there a plan to
  retire it?
- What does the `hoc_legacy` engine still serve?
- Are `practice_problems` and `challenges` two generations of the same idea?
- Is `widget2_controller` a successor to the `Widget` level type?

### Product surfaces

- `brand-router-enabled` and `default-brand` imply studio serves more than one
  brand. Which brands, and who sees which?
- Three of the five `ParentMailer` methods have no in-repo caller. Dispatched
  externally, or dead?
- `InactiveUserPurgeMailer` has no production call site. Is the warning email
  actually sent?
- Two version-history dialogs exist (with and without commits). Which is
  current?
- Is Maker Toolkit still supported after the Chrome Apps deprecation?
- Where does the CAP restriction on linking a new personal account surface in
  the UI?
- Who may reach `/lti/v1/integrations/new` — any signed-in teacher, or is it
  gated?
- The DSCO-to-MUI migration state is not recorded in one place.

### Local verification

- Can an LTI launch be exercised locally without external secrets?
- What do `seed:sample_data` and `seed:mega_section` actually populate? Both
  are writes and were not read.
- Are Clever and Google OAuth credentials configured locally? They were not
  found in `config/development.yml.erb` and `locals.yml` was not read because
  it may hold secrets. Not a blocker: the test-only `create_user` endpoint
  injects an `OmniAuth::AuthHash` server-side and never contacts the provider.

## Notes on this inventory's own limits

- 300 items is a first pass, not a census. The `api/v1` namespace alone has
  roughly one route per UI state flag, and those are collapsed into a single
  item (`account-ui-state-flags`) rather than enumerated.
- `apps/src/templates` has 188 entries mixing teacher tools, shared components
  and page shells. It is the least-structured directory in the repo and the
  hardest thing to draw a doc boundary around. Expect the frontend domain to
  need a second pass on it.
- Nothing here was verified in a browser, by instruction. Journeys 9 through
  11 and 13 through 16 are assembled from routes and code, not from a walked
  path, and are marked INFERRED in `journeys.md`.
- Level-type row counts, user-type counts and table row counts are OBSERVED
  from the local development database, which carries prior test residue and is
  not representative of production distribution.
