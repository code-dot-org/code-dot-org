# Web Lab 2 / pyodide preview domain migration (codeprojects.org → codeaiprojects.org)

## Why

Some school-district content filters (e.g. Lightspeed) block `codeprojects.org`,
including `*.preview.codeprojects.org`, classifying the per-project-UUID
subdomain structure as "proxy-like." Web Lab 2's preview is not a proxy — the
service worker fetches from the student's own browser, so requests traverse a
school's filter normally — but it shares an apex with legacy Web Lab, which
served raw student HTML for years and earned the domain its reputation.

This migration moves the **sandboxed-preview origin** — used by both Web Lab 2
(`weblab2`) and Python Lab's pyodide sandbox — off `codeprojects.org` onto a
dedicated domain, `codeaiprojects.org`, whose reputation starts fresh. Legacy
Web Lab (`weblab`) stays on `codeprojects.org`.

The studio share URL (`studio.code.org/projects/weblab2/<channel>`) does **not**
change, so existing shared links keep working; only the inner preview origin the
share page embeds moves.

## Scope of the application cutover (Part 2)

The server serves the preview endpoints on **both** domains
(`CDO.preview_codeaiprojects_hostname` and the pre-migration
`CDO.preview_codeprojects_hostname`, `lib/cdo.rb`); the client decides which
one to embed via `getPreviewDomain()`
(`apps/src/util/sandboxedPreviewDomain.ts`), with this precedence:

1. **`new-preview-domain` experiment** — per-session opt-in to the new domain
   (`?enableExperiments=new-preview-domain`), for production bug bashes. It
   also turns on Python Lab's sandbox iframe (see below).
2. **`sandboxed-preview-domain` DCDO flag** — per-environment rollout and
   rollback, no deploy needed in either direction. Exposed to the frontend
   through `frontend_config` (`lib/dynamic_config/dcdo.rb`). Values outside
   the two known domains fall back to the default.
3. **Default: `codeprojects.org`** (pre-migration) until the new domain has
   been bug bashed; the code default flips in Part 3.

Dual-domain (accept either, no flag needed — pages derive their outer origin
from their own hostname):

- Routing / host constraints — `dashboard/config/routes.rb`. The preview
  constraint blocks sit at the very top of the route table so that a preview
  host can reach no other *Rails route*: a `match '*path' ... via: :all`
  catch-all 404s everything else before the host-unconstrained routes
  (`draw :api`, `draw :marketing`, `/cable`, ...) are consulted.
  `dashboard/test/integration/preview_hosts_test.rb` pins this containment.
  Caveat: Rack middleware mounted ahead of routing (`FilesApi` and friends,
  `/v3/...` — see `dashboard/config/application.rb`) has no host constraint
  and still answers on the preview hosts; route order cannot change that.
- Preview CSP (`frame-ancestors`, dev websocket `connect-src`) —
  `dashboard/app/controllers/codeprojects_preview_controller.rb`
- Level-starter-asset CORS — `dashboard/app/controllers/level_starter_assets_controller.rb`
- Session-cookie domain scoping — `lib/cdo/rack/request.rb`
- Dev host allowlists — `dashboard/config/environments/development.rb`, `apps/webpack.config.js`
- Origin-parsing helpers — `apps/src/util/codeprojectsPreviewOrigin.ts`, `apps/src/weblab2/htmlPreview/weblab2_project_service_worker.js`
- Dev SW fallback — `apps/src/weblab2/htmlPreview/useProjectServiceWorker.ts`

Flag-driven (pick the domain to embed):

- Domain selection — `apps/src/util/sandboxedPreviewDomain.ts`. Kept apart from
  `codeprojectsPreviewOrigin.ts` because the preview pages import that module
  and their bundles have none of studio.code.org's page globals — notably the
  `$` that `experiments.js` transitively needs.
- Preview URL builders — `apps/src/weblab2/htmlPreview/HTMLPreview.tsx`,
  `apps/src/pythonlab/pyodideSandboxManager.ts`, both via `getPreviewDomain()`
- Experiment constant — `apps/src/util/experiments.js`
  (`NEW_PREVIEW_DOMAIN = 'new-preview-domain'`)

Because both domains keep serving previews, clients running a stale bundle
(open tabs, CDN-cached JS) keep working across the deploy and across flag
flips.

Note Python Lab's sandbox is itself gated: the iframe is used only when
`pythonlab-separate-domain` or `new-preview-domain` is on
(`apps/src/pythonlab/pyodideManager.ts`). `getPreviewDomain()` only matters
inside that gate. Web Lab 2 has no such gate — its preview is always an iframe
on a preview subdomain.

The Rails controller/route/view keep the `codeprojects_preview` name (internal
only, no functional coupling to the domain) to limit churn.

## ⚠️ Ordering — infra MUST land before the flag flip

`staging` auto-deploys, but with the default on `codeprojects.org` the app
change is safe to deploy independently — nothing points at the new domain
until the `new-preview-domain` experiment or the `sandboxed-preview-domain`
flag does. The hard requirement moves to the flag flip: do not point an
environment at `codeaiprojects.org` before that environment's
`*.preview.codeaiprojects.org` resolves and serves a valid cert, or its
previews break until the flag is reverted.

The two changes are therefore split into separate PRs (see below): the
infrastructure lands and finishes propagating first, then the application cutover
merges.

`cloud_formation_stack.yml.erb` looks up `CDO.hostedzone_id('codeaiprojects.org')`
unconditionally. If the hosted zone is missing, template render fails loudly
rather than silently skipping the preview resources.

## Infrastructure steps

Per environment (production uses the bare apex; test/staging/adhoc use
`<stack>.codeaiprojects.org`, matching the codeprojects convention in
`lib/cdo.rb`):

1. ~~**Register `codeaiprojects.org`**~~ — **done.** Registered via Amazon
   Registrar.
2. ~~**Create a Route 53 hosted zone and delegate to it.**~~ — **done.** The zone
   is live and delegated (four `awsdns` nameservers resolve publicly), so
   `CDO.hostedzone_id('codeaiprojects.org')` resolves for the CICD process.
3. **Deploy the CloudFormation stack.** The stack emits
   `CodeaiprojectsCertificate` (DNS-validated; validation records auto-created in
   the zone), the `CodeaiprojectsCloudFrontDistribution`, and the
   `*.preview.codeaiprojects.org` alias. Wait for the ACM cert to validate and
   the distribution to deploy — roughly 5–20 minutes after the stack itself
   reports success.
4. **Verify** (read-only):
   - `curl -sSI https://<any-uuid>.preview.codeaiprojects.org/ ` returns a
     response served by the dashboard origin (200 shell or 404 from
     `CodeprojectsPreviewController#not_found`) carrying the preview
     `Content-Security-Policy` header.
   - `curl -sSI https://<uuid>.preview.codeaiprojects.org/weblab2_project_service_worker.js`
     returns `application/javascript`.
5. **Merge + deploy Part 2**, then roll out per environment:
   - Bug bash on the new domain with `?enableExperiments=new-preview-domain`
     (per-session, nobody else affected). Load a Web Lab 2 share and a Python
     Lab level; confirm the preview iframe points at
     `*.preview.codeaiprojects.org` and renders.
   - Set `DCDO.set('sandboxed-preview-domain', 'codeaiprojects.org')` in the
     environment to move everyone.

## Local development

Local previews use `*.preview.localhost.codeprojects.org` by default, or
`*.preview.localhost.codeaiprojects.org` with the flag/experiment. Both
resolve to `127.0.0.1` via staging-managed Route 53 records (the legacy
component and `LocalhostCodeaiprojectsRecord` /
`LocalhostPreviewCodeaiprojectsRecord` in `codeaiprojects_resources.yml.erb`);
`/etc/hosts` entries work if you'd rather not rely on public DNS.

Set the Chrome insecure-origin flag per `apps/src/weblab2/README.md` (the
recommended value covers both domains, so it survives flag flips).

## Pull requests

- **Part 1 — infrastructure:** the CloudFormation component, stack wiring, and
  this runbook. Deploy and verify before Part 2.
- **Part 2 — application cutover:** `CDO.codeaiprojects_hostname` plus every
  caller (routes, preview CSP, level-starter-asset CORS, cookie scoping, the
  frontend preview-URL builders and origin-parsing helpers, and dev host
  allowlists).
- **Part 3 — cleanup:** retire the unused `*.preview.codeprojects.org`
  infrastructure and the transitional route guard. Details below.

## Part 3 — cleanup

Do this only after Part 2 has deployed and been verified in **every**
environment. None of it is user-facing; it removes infrastructure and code that
no longer serves traffic.

Part 2 leaves `*.preview.codeprojects.org` fully serving previews so the
`sandboxed-preview-domain` DCDO flag can revert to it. Part 3 retires that:
**confirm the flag is unset (or set to `codeaiprojects.org`) everywhere and has
been stable there, then delete the infrastructure first, then the code paths.**

1. **Remove the preview resources from
   `aws/cloudformation/components/codeprojects_resources.yml.erb`** (the legacy
   component). Every reference to `preview` in that file:
   - the `*.preview.${CodeprojectsBaseDomainName}` certificate SAN and its
     matching `DomainValidationOptions` entry
   - the `*.preview.${CodeprojectsBaseDomainName}` Route 53 record
   - the `*.preview.${CodeprojectsBaseDomainName}` CloudFront alias
   - the staging-only `*.preview.localhost.codeprojects.org` dev record
   - the domain list in the file's header comment

   ⚠️ Removing a SAN **replaces the ACM certificate**, which forces an update of
   the *legacy* CloudFront distribution (roughly 15 minutes of propagation).
   Schedule this deliberately rather than bundling it with unrelated stack
   changes.

2. **Remove the dual-domain code paths.** Safe once step 1 has deployed,
   because the old hostnames no longer resolve:
   - `CDO.preview_codeprojects_hostname` (`lib/cdo.rb`) and its uses in
     `dashboard/config/routes.rb` (`preview_host_pattern`), the preview CSP
     (`codeprojects_preview_controller.rb`), and the starter-asset CORS
     pattern (`level_starter_assets_controller.rb`)
   - `apps/src/util/sandboxedPreviewDomain.ts` in its entirety (callers
     hardcode `codeaiprojects.org`), along with the `sandboxed-preview-domain`
     flag entry in `lib/dynamic_config/dcdo.rb`, `experiments.NEW_PREVIEW_DOMAIN`
     (`apps/src/util/experiments.js`) and its use in
     `apps/src/pythonlab/pyodideManager.ts`
   - the `code(?:ai)?projects` regex alternations in
     `codeprojectsPreviewOrigin.ts`, `weblab2_project_service_worker.js` and
     `useProjectServiceWorker.ts`
   - the codeprojects cases in `dashboard/test/integration/preview_hosts_test.rb`
     and `dashboard/test/controllers/level_starter_assets_controller_test.rb`

3. **Remove the dead development host entries** for the old preview origin:
   - `dashboard/config/environments/development.rb` — the
     `/[^.]+\.preview\.localhost\.codeprojects\.org/` pattern
   - `apps/webpack.config.js` — `.preview.localhost.codeprojects.org`

   Keep the bare `localhost.codeprojects.org` entries in both files; legacy Web
   Lab still needs them locally.

4. **Optional, cosmetic.** These names still say `codeprojects` but have no
   functional coupling to the domain; they were left alone to keep the cutover
   diff reviewable. Rename only if the churn is worth it:
   `apps/src/util/codeprojectsPreviewOrigin.ts`,
   `dashboard/app/controllers/codeprojects_preview_controller.rb`, and the
   `codeprojects_preview` route names and view directory.

### What stays on codeprojects.org permanently

Legacy Web Lab's serving path is not part of this migration. Do **not** remove:

- `CDO.codeprojects_hostname` (`lib/cdo.rb`)
- the `/weblab/footer` route and the legacy share redirect to
  `codeprojects.org/<channel>/` (`dashboard/config/routes.rb`)
- the `code_projects_domain` routes that serve legacy student HTML
  (`dashboard/legacy/middleware/files_api.rb`)
- `codeprojects.org` in the shared-cookie-domain list (`lib/cdo/rack/request.rb`)
- the bare `localhost.codeprojects.org` development hosts
- everything else in `codeprojects_resources.yml.erb` (apex, `www`, `static`,
  `bramble-download`)

## Rollback

Unset the `sandboxed-preview-domain` DCDO flag (or set it to
`codeprojects.org`). No deploy is required: both domains' routes, CORS and CSP
stay live throughout Part 2, so new page loads embed the old preview origin as
soon as the flag propagates (pages already open pick it up on reload).
Reverting the Part 2 code is also safe but should not be necessary.

This is only true while Part 3 is outstanding. Once Part 3 has removed the
`*.preview.codeprojects.org` certificate SAN, DNS record and CloudFront alias,
the flag has nothing to point back to — the old hostnames will not resolve.
After that point, roll back by reverting Part 3 as well, or by fixing forward.

## Notes / open items

- **Old shared links:** studio share URLs are unchanged, so no redirects are
  required for end users. A district that blocks `codeprojects.org` no longer
  needs to allowlist it for Web Lab 2 to work, since previews no longer live
  there.
- **Session cookie:** `lib/cdo/rack/request.rb` now scopes `_learn_session` for
  `codeaiprojects.org` at parity with the old behavior. Previews are designed to
  be session-isolated (see `apps/src/util/codeprojectsPreviewOrigin.ts`);
  confirm whether the cookie should be set on the new domain at all, or dropped.
- **Shared distribution check:** the codeaiprojects CloudFront distribution and
  ACM cert are distinct resources from codeprojects — the new domain does not
  share reputation, a cert, or a distribution with the old one.
