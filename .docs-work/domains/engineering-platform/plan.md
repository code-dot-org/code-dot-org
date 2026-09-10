# engineering-platform plan

## Engineer's moments

1. I just cloned this repo. What am I looking at?
2. A request hits studio.code.org. What touches it?
3. I need to add business logic. Where does it go?
4. I need to run something in the background.
5. How does email get sent?
6. Something broke. Where do errors go?
7. I need to ship a feature behind a flag, then to everyone.
8. How does the frontend get built and served?
9. Where do I find configuration that varies by environment?

## Pages

### Hubs (no evidence files)

| path | question |
|---|---|
| `docs/developers/index.md` | Which section of developer docs do I need? |
| `docs/developers/platform/index.md` | What does engineering-platform cover? |
| `docs/developers/labs/index.md` | Hub for labs pages (stub, not my content) |
| `docs/developers/projects/index.md` | Hub for projects pages (stub) |
| `docs/developers/integrations/index.md` | Hub for integrations pages (stub) |
| `docs/developers/ai/index.md` | Hub for AI pages (stub) |
| `docs/developers/professional-learning/index.md` | Hub for PL pages (stub) |

### Topic pages

| # | path | type | question | inventory ids | applies to |
|---|---|---|---|---|---|
| 1 | `docs/developers/platform/system-overview.md` | concept | Moments 1-2. The Rails monolith, Sinatra middleware, lib/ and shared/, apps/ bundle, frontend/ Turborepo, pegasus, the request path, where state lives. | dev-rails-monolith, dev-sinatra-middleware, dev-root-lib-and-shared, dev-pegasus | all engineers |
| 2 | `docs/developers/platform/conventions-and-layering.md` | concept | Moment 3. Services/Policies/Queries/Forms, engines, models, where new code goes. | dev-services-policies-queries | all engineers |
| 3 | `docs/developers/platform/background-jobs.md` | concept | Moment 4. ActiveJob + delayed_job, k8s worker, Chef crontab, adding a job. | dev-background-jobs, dev-python-jobs | all engineers |
| 4 | `docs/developers/platform/email-pipeline.md` | concept | Moment 5. Poste2 end to end, Mailjet, interceptors, sending locally. | email-delivery-pipeline | all engineers |
| 5 | `docs/developers/platform/observability.md` | concept | Moment 6. Honeybadger, Sentry, Observability::Errors.report, logs, tracing a request. | (cross-cutting, references docs/logging.md) | all engineers |
| 6 | `docs/developers/platform/availability-and-configuration.md` | concept | Moments 7 and 9. DCDO, Gatekeeper, experiments, pilots, locals.yml, yml.erb, environments, staff consoles, flag lifecycle. Journey 10. | dev-rails-environments, staff-dcdo-console, staff-gatekeeper-console, staff-feature-mode, staff-dynamic-config-viewer, staff-pilot-management, user-join-pilot-by-link | all engineers |
| 7 | `docs/developers/platform/frontend-build.md` | concept | Moment 8. apps/ webpack/rspack, entries, Rails mount, frontend/ Turborepo, design system, i18n layout. | dev-apps-bundle, dev-frontend-turborepo, dev-design-system, dev-i18n-pipeline, frontend-studio-mount | all engineers |

## Terminology observed

- "DCDO" (Dynamic Config, Data Operations) -- the UI says "DCDO" on the admin console
- "Gatekeeper" -- the admin console uses this label
- "feature mode" -- the admin console label
- "pilot" -- the term used in the Pilot model and admin UI
- "experiment" -- the Experiment model; pilots are a kind of experiment
- "delayed_job" -- the ActiveJob adapter in production
- "Poste2" -- the homegrown mail layer; not visible to end users

## Assumed link paths

- `/developers/operations/` -- delivery-and-operations domain (next wave)
- `/developers/operations/local-setup/` -- SETUP.md equivalent
- `/developers/operations/test-suites/` -- TESTING.md equivalent
- `/developers/operations/deploy-targets/` -- environments/deploy doc
- `/developers/platform/authentication/` -- already exists

## Questions for Fable

None blocking. The only cross-domain question is whether "observability"
should also cover the infrastructure logs (CloudWatch, Athena) or only
app-level. Decision: this page covers app-level (Honeybadger, Sentry,
`Observability::Errors.report`, lograge) and links to `docs/logging.md`
and `docs/log-formats.md` for infrastructure logs, leaving infra-log
docs to delivery-and-operations.
