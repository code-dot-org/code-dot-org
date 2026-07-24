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

## Local development

Local previews use `*.preview.localhost.codeaiprojects.org`. Two options:

- Rely on the staging-managed Route 53 records
  (`LocalhostCodeaiprojectsRecord`, `LocalhostPreviewCodeaiprojectsRecord` in
  `codeaiprojects_resources.yml.erb`) that resolve to `127.0.0.1`, or
- Add `/etc/hosts` entries mapping `localhost.codeaiprojects.org` and a test
  preview label (e.g. `localtesting.preview.localhost.codeaiprojects.org`) to
  `127.0.0.1`.

Then update the Chrome insecure-origin flag per `apps/src/weblab2/README.md`
(the four URLs now use `codeaiprojects.org`).

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

Part 2 leaves `*.preview.codeprojects.org` resolving (the legacy component still
provisions it) but matching no preview route. A transitional guard in
`dashboard/config/routes.rb` — the `retired_preview_host` local excluded from the
dashboard block — makes those hostnames 404 rather than fall through to the full
dashboard route table. Part 3 removes both the guard and the DNS that makes it
necessary, in that order of dependency: **delete the infrastructure first, then
the guard.**

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

2. **Remove the transitional route guard** in `dashboard/config/routes.rb`: the
   `retired_preview_host` local and its alternative in the negative-lookahead
   host constraint. Safe once step 1 has deployed, because the hostnames no
   longer resolve.

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

Revert **Part 2**. Because the legacy `codeprojects.org` resources are untouched
and the codeaiprojects CloudFront distribution and certificate are separate
resources, reverting the application cutover restores
`*.preview.codeprojects.org` previews immediately. The codeaiprojects
infrastructure from Part 1 can be left in place (idle) or torn down separately.

This is only true while Part 3 is outstanding. Once Part 3 has removed the
`*.preview.codeprojects.org` certificate SAN, DNS record and CloudFront alias,
reverting Part 2 alone no longer restores previews — the old hostnames will not
resolve. After that point, roll back by reverting Part 3 as well, or by fixing
forward.

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
