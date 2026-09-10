---
title: Conventions and layering
description: Where business logic goes in the CodeAI Rails app -- Services, Policies, Queries, Forms, engines, and models.
type: concept
---

The dashboard Rails app uses a set of plain-Ruby-object (PORO) conventions to keep business logic out of controllers and models. When you add a new feature, the conventions below tell you where the code belongs.

## Services, Policies, Queries, and Forms

Four directories under `dashboard/lib/` hold POROs namespaced by purpose. Each has its own README with rationale and examples.

| Directory | Namespace | Purpose | Count |
|---|---|---|---|
| `dashboard/lib/services/` | `Services::` | Operations that _do something_ -- create, update, orchestrate. | 52 files |
| `dashboard/lib/policies/` | `Policies::` | Predicates that _tell you about something_ -- authorization checks, eligibility, business rules. | 14 files |
| `dashboard/lib/queries/` | `Queries::` | Reads that _retrieve something_ -- complex queries that do not belong on the model. | 13 files |
| `dashboard/lib/forms/` | `Forms::` | Form objects for multi-model validation and transactional form processing. | 1 file |

These live under `dashboard/lib/`, not `dashboard/app/`. There is no `dashboard/app/services/`. This trips up newcomers who expect the Rails convention of `app/services/`.

Zeitwerk autoloads `dashboard/lib/` as a top-level namespace, so `Services::User::Create` maps to `dashboard/lib/services/user/create.rb`.

### When to use each

- A controller action that validates input and writes to the database: the write goes in a `Services::` object; the controller calls it.
- A check that decides whether a user can perform an action: `Policies::`.
- A read that joins multiple tables or applies complex filtering: `Queries::`.
- A form that creates or updates records across several models in one transaction: `Forms::`.

For the README of each convention, see:
- [dashboard/lib/services/README.md](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/lib/services/README.md)
- [dashboard/lib/policies/README.md](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/lib/policies/README.md)
- [dashboard/lib/queries/README.md](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/lib/queries/README.md)
- [dashboard/lib/forms/README.md](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/lib/forms/README.md)

## Engines

Three Rails engines extend the monolith without adding code to the main `app/` tree:

| Engine | Purpose |
|---|---|
| `dashboard/engines/observability/` | Wraps Sentry and Honeybadger behind a unified `Observability::Errors.report` API. See [Observability](/developers/platform/observability/). |
| `dashboard/engines/cdo_contentful/` | Contentful CMS integration for marketing and editorial content. |
| `dashboard/engines/hoc_legacy/` | Hour of Code legacy routes and controllers. |

## Models

The `dashboard/app/models/` directory holds 350 model files. Subdirectories group related models: `levels/` (level type subclasses), `experiments/` (pilot and experiment records), `sections/` (section type subclasses), and `pd/` (professional development).

The `User` model is large and uses STI: `users.user_type` is either `student` or `teacher`, loading as a `Student` or `Teacher` subclass. `users.admin` is a separate boolean for Code.org staff (see [Authentication and authorization](/developers/platform/authentication/)).

## Controllers

A controller action opens with a one-line comment naming its HTTP verb and path:

```ruby
# GET /sections/:id
def show
```

Authorization uses CanCanCan (`authorize!` or `load_and_authorize_resource`). Authentication uses Devise (`authenticate_user!` or Warden). For the full permission model, see [Authentication and authorization](/developers/platform/authentication/).

## Where new code goes

| You are writing... | Put it in... |
|---|---|
| A new operation with side effects | `dashboard/lib/services/<domain>/<verb>.rb` |
| A business-rule predicate | `dashboard/lib/policies/<domain>.rb` |
| A complex read | `dashboard/lib/queries/<domain>.rb` |
| A multi-model form | `dashboard/lib/forms/<domain>.rb` |
| A new model | `dashboard/app/models/` (in the appropriate subdirectory) |
| A new controller | `dashboard/app/controllers/` (namespaced if appropriate) |
| A new background job | `dashboard/app/jobs/` (see [Background jobs](/developers/platform/background-jobs/)) |
| A new mailer | `dashboard/app/mailers/` (see [Email pipeline](/developers/platform/email-pipeline/)) |
| Client-side code for an existing lab | `apps/src/<lab>/` |
| A new lab (lab2 framework) | `apps/src/<lab>/` with lab2 wiring (see [Add a lab](/developers/labs/add-a-lab/)) |
| A new reusable frontend package | `frontend/packages/<name>/` (see `frontend/AGENTS.md`) |
