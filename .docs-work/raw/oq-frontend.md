# Frontend open-questions sweep (rev 9793f8d36ae)

Bounded evidence for open-questions.md items 2, 4, 5, 17, 19, plus the version-history aside.
Read-only Grep/Glob/Read/Bash. No files modified.

## 1. Duplicated frontends (open question 2)

### Music Lab: `apps/src/music` vs `frontend/packages/labs/music`

- Production tree today: `apps/src/music` — STRONGLY SUPPORTED.
- Legacy route: `resources :projects` generates `music_project_edit` etc. from
  `ProjectsController::STANDALONE_PROJECTS` (`music:` key at
  `dashboard/app/controllers/projects_controller.rb:156`), routed via
  `dashboard/config/routes.rb:371-380` (`get "/#{key}/:channel_id/edit", to:
  'projects#edit'`). `ProjectsController#edit` (`:517`) calls `show`, which
  renders the legacy webpack bundle built from `apps/src/music`.
- Webpack entries for the music UI shell:
  `apps/webpackEntryPoints.js:50-52` (`musiclab/menu`, `musiclab/gallery`,
  `musiclab/embed`), each importing `@cdo/apps/musicMenu/MusicMenu` or
  `@cdo/apps/music/views/MiniMusicPlayer` — OBSERVED
  (`apps/src/sites/studio/pages/musiclab/{menu,gallery,embed}.js`).
- New tree mount point: `frontend/packages/labs/music` (package
  `@code-dot-org/music-lab`) is lazy-loaded only from
  `frontend/apps/studio/src/modules/labs/router/getLabEntrypoint.ts:11`
  (`lazy(() => import('@code-dot-org/music-lab'))`), inside the separate
  `frontend/apps/studio` app — STRONGLY SUPPORTED.
- Rails mount for `frontend/apps/studio`: `dashboard/config/routes.rb:40`
  `get "frontend-studio(/*path)", to: "frontend_studio#index"`.
  `FrontendStudioController#index`
  (`dashboard/app/controllers/frontend_studio_controller.rb:4`):
  `return head :not_found unless DCDO.get('frontend_studio_enabled',
  !Rails.env.production?)` — default is `true` off-production, `false` in
  production. No yml default override found (`grep -rn
  frontend_studio_enabled dashboard/ lib/` → only this one call site) —
  STRONGLY SUPPORTED that the new tree is off by default in production.
- Verdict: legacy `apps/src/music` serves production today; the new package
  is gated behind `frontend_studio_enabled` (default false in prod) and is
  reached only through the separate `/frontend-studio` mount, not the
  `/projects/music/...` routes that legacy Music Lab uses.

### localization: `apps/src/localization` vs `frontend/packages/core/src/plugins/localization`

- `apps/src/localization` is imported by ~20+ files across many legacy labs
  (dance, fish, applab, blockly, lab2 hooks) — OBSERVED, e.g.
  `apps/src/StudioApp.js`, `apps/src/dance/Dance.js`, `apps/src/fish/Fish.js`,
  `apps/src/applab/applab.js`, `apps/src/lab2/hooks/useLevelActivityMetrics.ts`.
  Also has its own webpack entry,
  `apps/webpackEntryPoints.js:286` (`localization:
  './src/localization/entrypoint.js'`), used for a standalone
  localization-testing bundle, not the shared import mechanism itself.
- `frontend/packages/core/src/plugins/localization` has zero importers found
  under `apps/src` or `frontend/packages/labs`; its only referenced consumers
  are inside `frontend/apps/studio/src/**` (footer, auth, config, routes) —
  OBSERVED. That app is the same `frontend-studio`-gated tree as Music Lab
  above.
- Verdict: `apps/src/localization` serves production (widely used by the live
  `apps/` bundle); the `frontend/packages/core` plugin is used only inside the
  gated `frontend/apps/studio` tree — same selection mechanism as Music Lab
  (the `frontend_studio_enabled` DCDO flag).

### "simplified sign-up": `apps/src/simpleSignUp` vs `apps/src/signUpFlow`

- CORRECTION TO PREMISE — STRONGLY SUPPORTED: these are not two
  implementations of the same feature. `apps/src/simpleSignUp` contains only
  an `lti/` subtree (`link-account.module.scss`, `lti/iframe`,
  `lti/registration`, `lti/sync`, `lti/upgrade`, `lti/link`) — all LTI
  account-linking/registration/sync/upgrade UI. `apps/src/signUpFlow`
  contains the general Devise account-type/finish-account/login-type
  components (`AccountType.tsx`, `FinishStudentAccount.tsx`,
  `FinishTeacherAccount.tsx`, `LoginTypeSelection.tsx`).
- `signUpFlow` components are imported by
  `apps/src/sites/studio/pages/devise/registrations/{account_type,
  finish_teacher_account, finish_student_account, login_type}.js`, which are
  webpack entries at `apps/webpackEntryPoints.js:65-71`, and mounted from
  Rails views `dashboard/app/views/devise/registrations/account_type.html.haml:3`
  and `.../finish_teacher_account.haml:3` (`webpack_asset_path('js/devise/
  registrations/...')`).
- `simpleSignUp/lti/*` components are imported by
  `apps/src/sites/studio/pages/lti/v1/{iframe, account_linking/landing,
  dynamic_registration, sync_course, upgrade_account}.js`
  (`apps/webpackEntryPoints.js:108-112`), mounted from
  `dashboard/app/views/lti/v1/upgrade_account.html.haml:5` and
  `.../account_linking/landing.haml:28`.
- Verdict: no flag chooses between them because they are not alternatives —
  `signUpFlow` is the Devise/general sign-up UI; `simpleSignUp` is LTI-only
  account linking/registration UI. Both are live in production, for
  different routes.

## 2. Skills dashboard (open question 4)

- `SkillsController` at `dashboard/app/controllers/skills_controller.rb:1-2`:
  `before_action :authenticate_user!` and `load_and_authorize_resource only:
  [:index, :create, :update, :destroy]` (CanCanCan gate) — STRONGLY
  SUPPORTED, this action is NOT unauthenticated.
- Rails route: `dashboard/config/routes.rb:115-117`
  `resources :skills, only: [:create, :index, :update, :destroy]` plus
  `get 'section/:section_id/unit/:unit_name', to: 'skills#section_skills'`.
  `section_skills` action calls `authorize! :manage, section` explicitly
  (`skills_controller.rb`, in `section_skills`).
- This Rails `/skills` endpoint is a JSON API, not the client-visible teacher
  page in the open question. The client-visible "Skills dashboard" is a React
  route: `apps/src/templates/teacherNavigation/TeacherNavigationRouter.tsx:336-341`
  ```
  {DCDO.get('skills-dashboard', false) && (
    <Route path={TEACHER_NAVIGATION_PATHS.skills} element={<SkillsDashboard />} />
  )}
  ```
  Path constant: `apps/src/templates/teacherNavigation/TeacherNavigationPaths.tsx:26`
  `skills: 'skills_in_dev'` and label at `:150-155`
  `label: 'Skills (In Development)'`.
- DCDO default: `lib/dynamic_config/dcdo.rb:58`
  `'skills-dashboard': DCDO.get('skills-dashboard', false)` inside
  `def frontend_config` (`:26`) — default `false`, no yml override found
  (`grep -rn skills-dashboard dashboard/config` → no hits) — STRONGLY
  SUPPORTED.
- Nav-item search: `TeacherNavigationBar.tsx` builds the visible sidebar from
  fixed key lists — `courseContentKeys` (`:116-124`), `defaultPerformanceContentKeys`
  (`:129-137`), `defaultClassroomContentKeys`/`classroomContentKeys`
  (`:140-146`). `'skills'` appears in none of them — STRONGLY SUPPORTED, no
  sidebar link exists. `grep -rln LABELED_TEACHER_NAVIGATION_PATHS apps/src`
  turned up only the 8 files that define/consume the whole path map; none
  builds a nav item list containing `skills`.
- Verdict: even with the DCDO flag on, the route `/teacher_dashboard/sections/
  :sectionId/skills_in_dev` renders (`<SkillsDashboard />`), but there is no
  discoverable UI path to it — a teacher would have to type the URL directly.
  Label text "Skills (In Development)" and path segment `skills_in_dev`
  corroborate this is an in-progress, not-yet-linked feature, not dead code:
  the component, controller, and route are all live and functioning, just
  unlinked. Reachable in production: only by direct URL, and only with the
  DCDO flag manually set on (default off).

## 3. Chatter (open question 5)

- Controller: `dashboard/app/controllers/chatter_controller.rb:1-3`
  ```
  class ChatterController < ApplicationController
    def index
    end
  end
  ```
  No controller-level `before_action` at all — STRONGLY SUPPORTED.
- `ApplicationController` before_actions
  (`dashboard/app/controllers/application_controller.rb:19-30`): `:handle_cap_lockout,
  :assert_lms_landing_policy` (only `if: :current_user`),
  `:configure_permitted_parameters` (only `if: :devise_controller?`),
  `:fix_crawlers_with_bad_accept_headers`, `:clear_sign_up_session_vars`,
  `:initialize_statsig_stable_id`, `:persist_brand_params` — none is an auth
  gate. `:check_profiler`/`:configure_web_console` (`:43,56`) are dev-only.
  STRONGLY SUPPORTED: no authentication is required to reach `#index`.
- Route: `dashboard/config/routes.rb:33` `get 'chatter/index'`, declared
  immediately after `mount ActionCable.server => '/cable'` (`:32`) and before
  `draw :api` / `draw :marketing` (`:35-36`) — i.e. inside the main
  unconstrained route block, not inside any host-constraint block (compare
  the preview-host `constraints host: ...` blocks at `:19-28`, which end
  before line 33). STRONGLY SUPPORTED: reachable on the main production host.
- View: `dashboard/app/views/chatter/index.html.erb` — a bare `<h1>Chat</h1>`
  demo page. Its `<script type="module">` imports ActionCable directly from
  `https://esm.sh/@rails/actioncable@8.0.201` (a CDN, not our own webpack
  bundle) — STRONGLY SUPPORTED there is no compiled JS entry point for this
  page; `grep -n chatter apps/webpackEntryPoints.js` and `find apps/src
  -iname "*chatter*"` both returned nothing.
- Helper: `dashboard/app/helpers/chatter_helper.rb` is an empty module
  (`module ChatterHelper\nend`).
- Channel: `dashboard/app/channels/chatter_channel.rb`
  ```
  class ChatterChannel < ApplicationCable::Channel
    def subscribed
      stream_from "chat-#{current_user.id}"
    end
    def speak(data)
      ActionCable.server.broadcast("chat-#{current_user.id}", data)
    end
  end
  ```
  `current_user` comes from `ApplicationCable::Connection#connect`
  (`dashboard/app/channels/application_cable/connection.rb:5-9`):
  `self.current_user = find_verified_user`, `find_verified_user` does
  `env['warden']&.user || reject_unauthorized_connection` — the WebSocket
  connection itself IS gated on being signed in (unauthenticated visitors get
  `reject_unauthorized_connection`), but the HTTP page (`GET
  /chatter/index`) that serves the HTML/JS demo is not gated at all.
- AI provider: no reference to any AI/LLM code in the controller, helper,
  channel, or view — STRONGLY SUPPORTED this is not AI-adjacent; it is a
  bare ActionCable chat demo. `open-questions.md`'s "AI-adjacent" framing is
  not supported by evidence found.
- Tests: none — `grep -rln "chatter\|Chatter" dashboard/test` → no hits.
- History: `git log -3 --oneline -- dashboard/app/controllers/chatter_controller.rb`
  → only 2 commits touch it ever: `b4eba4e9a39 Enable ActionCable (#67871)`
  (introduced it) and `4ed012e8a57` (an unrelated merge commit that happened
  to touch it, likely a rebase/merge artifact) — OBSERVED.
- Verdict: `GET /chatter/index` is reachable unauthenticated in production
  (page renders for anyone); the chat functionality itself (WebSocket
  subscribe/speak) requires a signed-in session via Warden. No AI provider
  call exists anywhere in this code path. Reads as a leftover ActionCable
  demo/spike, not a described product feature.

## 4. lab2 bootstrap contract (open question 17)

Legacy labs: `LevelsHelper#app_options` (`dashboard/app/helpers/levels_helper.rb:208`)
is a large dispatcher building a per-level-type options hash
(`levels_helper.rb:333-422`), branching on `@level.is_a?(Blockly)`,
`Weblab`/`Fish`/`Ailab`/`Javalab`, `DSLDefined`/`FreeResponse`/
`CurriculumReference`, `Widget`, `@level.unplugged?`, etc. Each branch
(`blockly_options`, `non_blockly_puzzle_options`, `question_options`,
`widget_options`, ...) assembles hundreds of legacy-specific fields (TTS
config, pairing, backpack, callouts, autoplay video, experiments list, theme,
report config). Rendered into the page as a raw JS global: `dashboard/app/views/levels/show.html.haml:69,75`
(`var appOptions = #{app_options.to_json};`) and
`dashboard/app/views/levels/_blockly.html.haml:20`. This is a synchronous,
server-rendered, one-shot payload with no follow-up client fetch for level
properties — legacy JS reads `window.appOptions` directly (used throughout
`apps/src/blockly`, `apps/src/applab`, etc., e.g.
`apps/src/blockly/blocklyWrapper.ts` reads `Renderers`/experiments off it
indirectly via `experiments.isEnabled`).

lab2 labs (Music, Pythonlab, Weblab2): the SAME `app_options` method
dispatches to a lab2-specific branch at `levels_helper.rb:333-334`:
`if @level.uses_lab2? then lab2_options` — the "app_options is only used by
legacy labs" comment at `levels_helper.rb:259` is about the immediately
preceding backpack-enablement code path, NOT about the `app_options` method
as a whole; the method's own dispatcher clearly calls `lab2_options` for
lab2 levels (STRONGLY SUPPORTED — this narrows/corrects the open question).
`lab2_options` (`levels_helper.rb:710-734`) returns a small, lab2-specific
subset: `level_id`, `channel` (if project level), `edit_blocks`,
`is_editing_exemplar`/`is_viewing_exemplar`, `share`,
`is_building_quiz_questions`, `public_caching`, `theme` — much smaller than
the legacy per-level-type hashes. This is serialized into the page at
`dashboard/app/views/levels/_lab2.html.haml:22`: `%script{src:
webpack_asset_path("js/lab2.js"), data: {appoptions: app_options.to_json}}`.
So lab2 DOES receive a JSON blob named `appOptions` via the same helper
method and the same `data-appoptions` attribute convention as legacy — but it
is a much thinner bootstrap payload (project/exemplar/sharing/theme flags
only), not the full level configuration. The full level configuration is
fetched client-side: `apps/src/lab2/hooks/useLoadLevelProperties.ts:14-17`
reads DCDO key `lab2-fetch-level-properties-by-lesson-id` (note: hyphenated
`-id` suffix, not exactly the bare `lab2-fetch-level-properties-by-lesson`
name in open-questions.md) with **default `true`**. When `true`, it fetches
`/lessons/${currentLessonId}/level_properties` (`:46`); when false,
`/s/${scriptName}/lessons/${lessonPosition}/level_properties` (`:47`); for a
standalone level (no lesson), `/levels/${currentLevelId}/level_properties`
(`:50-52`). Routes: `dashboard/config/routes.rb:462` (nested
`level_properties` under levels), `:537` (`get 'level_properties', to:
'lessons#level_properties'`), `:636` (`get :level_properties, to:
'lessons#level_properties_by_id'`) — served by
`dashboard/app/controllers/lessons_controller.rb` and
`dashboard/app/controllers/levels_controller.rb`.

AMBIGUOUS — DCDO key mismatch, confirmed by direct read: `lib/dynamic_config/dcdo.rb:66`
`'lab2-fetch-level-properties-by-lesson-id': DCDO.get('lab2-fetch-level-proper0ties-by-lesson-id', true)`
— the outer (exposed) key is spelled correctly and matches the frontend's
read key (`useLoadLevelProperties.ts:15`), but the *inner* `DCDO.get` call
reads a different, typo'd key (`proper0ties`, literal zero) that nothing
else in the repo sets. Any ops-side attempt to flip this flag via the
correctly-spelled DCDO key would be silently ineffective — the exposed
value is permanently pinned to the inner call's hardcoded default `true`.

Contrast: legacy labs get one large, synchronous, fully-populated
`appOptions` global with no further fetch. lab2 labs get a small synchronous
`appOptions` bootstrap (project/exemplar/theme context only) PLUS an async
client-side fetch of `level_properties` (by lesson id by default) that
supplies the actual level configuration for every level in the current
lesson. The two contracts share the same wire format/name (`appOptions`
JSON via `data-appoptions`) and the same Rails helper method as entry point,
but diverge sharply in payload size and in whether a second network fetch is
required.

## 5. Blockly renderer (open question 19)

- Production default: **Thrasos** — STRONGLY SUPPORTED.
  `apps/src/blockly/constants.ts:66-69`:
  ```
  GERAS: 'cdo_renderer_geras',
  THRASOS: 'cdo_renderer_thrasos',
  ZELOS: 'cdo_renderer_zelos',
  DEFAULT: 'cdo_renderer_thrasos',
  ```
- Renderer registration: `apps/src/blockly/blocklyWrapper.ts` registers all
  three custom renderer classes (`CdoRendererGeras`, `CdoRendererThrasos`,
  `CdoRendererZelos`) with Blockly's registry — none is registered
  conditionally; the default only takes effect because no `options.renderer`
  is set unless an experiment flips it.
- Selection code: `apps/src/StudioApp.js` (renderer-selection block,
  immediately preceded by the comment "Allows Blockly labs to use the Zelos
  or legacy Geras renderer instead of the default Thrasos."):
  ```
  if (experiments.isEnabled('zelos')) {
    options.renderer = Renderers.ZELOS;
  } else if (experiments.isEnabled('geras')) {
    options.renderer = Renderers.GERAS;
  }
  ```
  If neither experiment is enabled, `options.renderer` is left unset and
  Blockly falls back to `Renderers.DEFAULT` = Thrasos.
- No DCDO default or yml entry found for `zelos`/`geras` as flag names
  (`grep -rn "'zelos'\|'geras'" dashboard/config` → no hits); they are
  per-user/session `experiments` (client-side experiment flags), not DCDO
  keys. Music Lab additionally reads the same `zelos` experiment to select
  its own workspace renderer (`apps/src/music/blockly/MusicBlocklyWorkspace.ts:171`).

## Aside: two version-history dialogs

- `apps/src/templates/VersionHistory.jsx` (no commits) — imported by
  `apps/src/StudioApp.js:91` and wired into `initVersionHistoryUI`
  (`StudioApp.js:604,775,814-820`) — the general-purpose version history
  dialog used by the shared legacy app framework (applab, gamelab, etc.).
- `apps/src/templates/VersionHistoryWithCommitsDialog.jsx` — imported only by
  `apps/src/javalab/JavalabEditorDialogManager.jsx` — Javalab-specific,
  because Javalab supports named commits.
- Verdict: both are current; they are not two generations of the same
  dialog, they serve different labs with different feature needs (plain
  version history vs. commit-aware history for Javalab). Neither looks
  orphaned. OBSERVED.

## Unresolved

- Exact production traffic weighting of the LTI vs Devise sign-up trees was
  not measured (only route/import wiring was traced) — this doc corrects the
  open question's premise but does not quantify usage.
- Did not verify at runtime whether `frontend_studio_enabled` or
  `skills-dashboard` DCDO keys are currently set to non-default values in
  the production DCDO store (only defaults in code were confirmed; no prod
  DB/config access available from this environment).
- Did not check whether any other undiscovered nav surface (e.g. a
  mobile app, an admin panel) links to `/skills_in_dev` — only
  `apps/src/templates/teacherNavigation/**` was searched.
- Did not trace whether `lab2-fetch-level-properties-by-lesson-id`'s
  fallback (non-lesson-id) path is exercised in practice, or is vestigial.
