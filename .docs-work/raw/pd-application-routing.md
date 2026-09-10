# pd application routing — bounded evidence

Revision checked: 9793f8d36ae (staging, current HEAD).

## Verdict

Routes do not exist at this revision. `dashboard/config/routes.rb` carries no
route for teacher applications, facilitator applications, or principal
approval, and no controllers exist under `dashboard/app/controllers/pd/application/`.
The haml views the docs owner found are orphaned view templates with no
route or controller left to render them. `pd_application_principal_approval_url`
is an undefined route helper — the one caller of it
(`Pd::Application::TeacherApplication#principal_approval_url`,
`dashboard/app/models/pd/application/teacher_application.rb:255-256`) would
raise `NoMethodError` if invoked. Production application intake for teachers
happens off-platform at `https://code.org/apply` (external, not this repo's
routes/controllers).

## 1. Routes (none) — removal commit identified

`dashboard/config/routes.rb`, current state: grep for
`pd/application|principal_approval|teacher_application|facilitator_application|Pd::Application`
returns zero hits. `namespace :pd do ... end` (routes.rb:1032-1096) has no
`application` sub-namespace. The `concern :api_v1_pd_routes` block
(routes.rb:927-1004) still has `resources :applications, controller:
'applications', only: [:index, :show, :update, :destroy]` (routes.rb:982-989,
admin/API quick_view/cohort_view — unrelated to the public new/create forms)
but nothing for `teacher`, `facilitator`, or `principal_approval`.

Removed by commit `2f2f2700ad3c4dc62884b579e985c402875c9f4e` ("remove
pointers to teacher application pages", Turner Riley, 2025-09-03, confirmed
ancestor of current HEAD via `git merge-base --is-ancestor`). Diff deleted
from `dashboard/config/routes.rb`, inside `namespace :pd do`:

```
-      namespace :application do
-        get 'facilitator', to: 'facilitator_application#new'
-        get 'teacher', to: 'teacher_application#new'
-        get 'principal_approval/:application_guid', to: 'principal_approval_application#new', as: 'principal_approval'
-      end
```

(the `as: 'principal_approval'` here, nested under `namespace :pd`, is what
used to generate `pd_application_principal_approval_url`), plus the
API/create-side routes inside the `api_v1_pd_routes` concern:

```
-        namespace :application do
-          post :facilitator, to: 'facilitator_applications#create'
-          resources :teacher, controller: 'teacher_applications', only: [:create, :update] do
-            member do
-              post :send_principal_approval
-              post :change_principal_approval_requirement
-            end
-          end
-          post :principal_approval, to: 'principal_approval_applications#create'
-        end
```

and `pd/application_dashboard` react-router mount routes, `fit_weekend_registration*`
routes, and `applications_closed` routes (same commit).

Controllers left over from the same removal were deleted a day later by
`15fdd07b819` ("remove other teacher and principal application controllers",
2025-09-04): `dashboard/app/controllers/pd/application/principal_approval_application_controller.rb`
and `.../teacher_application_controller.rb`, plus their tests. No engine
under `dashboard/engines/*/config/routes.rb` (only `dashboard/engines/hoc_legacy/config/routes.rb`
exists) and no pegasus route defines any of these paths — confirmed via
repo-wide grep for `principal_approval` across `dashboard/`, `lib/`,
`pegasus/` (see section 3).

## 2. Controllers — none present

`dashboard/app/controllers/pd/application/` no longer exists as a directory
with a `*_controller.rb` in it. Only `dashboard/app/controllers/api/v1/pd/applications_controller.rb`
remains (backs the admin `resources :applications` API routes above, not the
public new/create forms). No `TeacherApplicationController`,
`PrincipalApprovalApplicationController`, or `FacilitatorApplicationController`
class exists anywhere in the tree (`grep -rln "class TeacherApplicationController\|class PrincipalApprovalApplicationController\|class FacilitatorApplicationController"` — zero hits).

The deleted `PrincipalApprovalApplicationController#new` (from
`git show 15fdd07b819`) had this gate, now moot since the route is gone:

```ruby
if Rails.env.production? && !current_user.try(:workshop_admin?) && Gatekeeper.disallows('pd_teacher_application')
  return head :not_found
end
```

Locally: `Gatekeeper.allows("pd_teacher_application")` → `false` (checked via
`bin/rails runner`, read-only). So even before the route removal, this
controller would 404 in production unless the requester was a workshop admin
or the `pd_teacher_application` gate was on — it is currently off.

`Pd::Application::TeacherApplication.open?` / `ActiveApplicationModels` /
`application_year` — not evaluated further; no controller consumes them for
these routes at this revision (out of scope once the routes/controllers are
confirmed absent).

## 3. `pd_application_principal_approval_url`

Defined nowhere as a route (see section 1) — the `principal_approval` route
name only ever existed nested `pd -> application -> principal_approval`,
which Rails would name `pd_application_principal_approval_url`. Sole
reference in application code:

- `dashboard/app/models/pd/application/teacher_application.rb:255-256`
  ```ruby
  def principal_approval_url
    pd_application_principal_approval_url(application_guid) if application_guid
  end
  ```

Consumed by four mailer views, all still present and presumably broken if
rendered:
- `dashboard/app/views/pd/application/teacher_application_mailer/admin_approval.html.haml:17`
- `dashboard/app/views/pd/application/teacher_application_mailer/admin_approval_teacher_reminder.html.haml:13`
- `dashboard/app/views/pd/application/teacher_application_mailer/confirmation.html.haml:43`
- `dashboard/app/views/pd/application/teacher_application_mailer/needs_admin_approval.html.haml:22`

No other definition of `principal_approval_url`/`pd_application_principal_approval_url`
exists in `dashboard/`, `lib/`, or `pegasus/`.

## 4. Local behavior (curl, dashboard running at :3000)

```
GET /pd/application/teacher                          -> 404
GET /pd/application/facilitator                       -> 404
GET /pd/application/principal_approval/abc123         -> 404
GET /professional-learning/application/teacher        -> 404
GET /my-professional-learning                         -> 302   (route exists, unauthenticated redirect — server is up)
```

`Gatekeeper.allows("pd_teacher_application")` → `false` locally
(`bin/rails runner`, dashboard/ cwd).

## 5. Frontend React app and production reach

React components still exist and still compile as part of the apps/ bundle,
mounted by the (now-unreachable) haml shells:

- `apps/src/code-studio/pd/application/teacher/TeacherApplication.jsx` — mounted by
  `dashboard/app/views/pd/application/teacher_application/new.html.haml:2,14`
  (`#application-container`, `js/pd/application/teacher_application/new.js`)
- `apps/src/code-studio/pd/application/principalApproval/PrincipalApprovalApplication.jsx` — mounted by
  `dashboard/app/views/pd/application/principal_approval_application/new.html.haml:2,8`
- `apps/src/code-studio/pd/application/ApplicationConstants.jsx` — shared constants
- `apps/src/code-studio/pd/application_dashboard/` (application_dashboard.jsx, application_loader.jsx,
  pathToApplicationHelper.js) — admin-facing dashboard, also unrouted since the same commit
  removed `get 'application_dashboard/*path' ...` and `get 'application_dashboard' ...`

No facilitator-application haml view was ever found under
`dashboard/app/views/pd/application/` (only `teacher_application/`,
`principal_approval_application/`, and `teacher_application_mailer/`
subdirectories exist) — facilitator application intake had a route
(`facilitator_application#new`, deleted in the same commit above) but no
corresponding view directory turned up in the current tree; not chased
further as out of scope for the docs question asked.

Production entry point for teachers is external: four teacher-application
mailer templates link out to `https://code.org/apply` (not a dashboard/
route, not found in `dashboard/config/routes.rb` or `pegasus/`):
- `dashboard/app/views/pd/application/teacher_application_mailer/_interested_teachers.html.haml:3`
- `dashboard/app/views/pd/application/teacher_application_mailer/declined.html.haml:22`
- `dashboard/app/views/pd/application/teacher_application_mailer/admin_approval_completed_teacher_receipt.html.haml:12`
- `dashboard/app/views/pd/application/teacher_application_mailer/admin_approval_completed.html.haml:13`

No `apply` links found in `apps/src/code-studio/pd/professional_learning/*.jsx`,
`apps/src/sites/studio/pages/pd/professional_learning/*.js`, or
`dashboard/app/views/pd/professional_learning/*.haml`, and no locale file
under `dashboard/config/locales/*.yml` mentions `code.org/apply` — the link
is a hardcoded mailer string, not a routed dashboard page or a
professional-learning-landing-page link. Whether `code.org/apply` itself is
served by pegasus or an entirely separate marketing stack was not checked
(out of scope — this repo's `pegasus/` routes were grepped for
`principal_approval` only, per the task's bound, and returned nothing).
