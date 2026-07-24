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

## Scope of the code change (this PR)

Single source of truth is `CDO.preview_codeaiprojects_hostname`
(`lib/cdo.rb`), built from a new `CDO.codeaiprojects_hostname`. This is a **hard
cutover**: once merged and deployed, previews point at
`*.preview.codeaiprojects.org`. Callers updated:

- Routing / host constraints — `dashboard/config/routes.rb`
- Preview CSP `frame-ancestors` — `dashboard/app/controllers/codeprojects_preview_controller.rb`
- Level-starter-asset CORS — `dashboard/app/controllers/level_starter_assets_controller.rb`
- Session-cookie domain scoping — `lib/cdo/rack/request.rb`
- Dev host allowlists — `dashboard/config/environments/development.rb`, `apps/webpack.config.js`
- Preview URL builders — `apps/src/weblab2/htmlPreview/HTMLPreview.tsx`, `apps/src/pythonlab/pyodideSandboxManager.ts`
- Origin-parsing helpers — `apps/src/util/codeprojectsPreviewOrigin.ts`, `apps/src/weblab2/htmlPreview/weblab2_project_service_worker.js`
- Dev SW fallback + docs — `apps/src/weblab2/htmlPreview/useProjectServiceWorker.ts`, `apps/src/weblab2/README.md`
- IaC — `aws/cloudformation/components/codeaiprojects_resources.yml.erb` (new), `aws/cloudformation/cloud_formation_stack.yml.erb`

The Rails controller/route/view keep the `codeprojects_preview` name (internal
only, no functional coupling to the domain) to limit churn.

## ⚠️ Ordering — infra MUST land before the app cutover

`staging` auto-deploys. If the app change deploys before
`*.preview.codeaiprojects.org` resolves and serves a valid cert, **all Web Lab 2
and Python Lab previews break**. Do the infra steps first, per environment, then
merge/deploy the app change.

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
5. **Merge + deploy the app cutover** (Part 2). Load a Web Lab 2 share and a
   Python Lab level; confirm the preview iframe now points at
   `*.preview.codeaiprojects.org` and renders.

## Pull requests

- **Part 1 — infrastructure:** the CloudFormation component, stack wiring, and
  this runbook. Deploy and verify before Part 2.
- **Part 2 — application cutover:** `CDO.codeaiprojects_hostname` plus every
  caller (routes, preview CSP, level-starter-asset CORS, cookie scoping, the
  frontend preview-URL builders and origin-parsing helpers, and dev host
  allowlists).

### Local development

Local previews use `*.preview.localhost.codeaiprojects.org`. Two options:

- Rely on the staging-managed Route 53 records
  (`LocalhostCodeaiprojectsRecord`, `LocalhostPreviewCodeaiprojectsRecord` in
  `codeaiprojects_resources.yml.erb`) that resolve to `127.0.0.1`, or
- Add `/etc/hosts` entries mapping `localhost.codeaiprojects.org` and a test
  preview label (e.g. `localtesting.preview.localhost.codeaiprojects.org`) to
  `127.0.0.1`.

Then update the Chrome insecure-origin flag per `apps/src/weblab2/README.md`
(the four URLs now use `codeaiprojects.org`).

## Rollback

Revert this PR. Because legacy `codeprojects.org` resources are untouched and
the codeaiprojects CloudFront distribution/cert are separate resources, reverting
the app change restores `*.preview.codeprojects.org` previews immediately. The
codeaiprojects infra can be left in place (idle) or torn down separately.

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
