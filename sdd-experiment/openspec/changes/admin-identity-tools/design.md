# admin-identity-tools design

## Context

StudioPerson merge/split/add_email live in admin_users_controller with
Firehose events (study: studio_person_audit, studio_person.rb:55,95,121).
assume_identity (admin_users_controller.rb:49) signs the admin in as the
target via Devise, sets session[:assumed_identity], logs a
log_admin_action line, and redirects — after it, the current session IS
the target user's session, so any SPA-cached AuthOutcome is stale by
construction.

## Goals / Non-Goals

**Goals:**
- StudioPerson operations become normal audited API endpoints.
- Impersonation keeps exactly one implementation (the legacy action),
  hardened with sudo + durable audit, launched from the SPA via
  full-page form POST.

**Non-Goals:**
- No JSON impersonation endpoint, ever, in this plan.
- No changes to StudioPerson model semantics or to how impersonated
  sessions behave once active.
- No "drop identity" redesign (whatever mechanism exists today is
  untouched).

## Decisions

1. **Impersonation stays server-rendered.** A fetch-based impersonation
   would succeed, mutate the session, and leave the SPA rendering admin
   UI as the wrong user until reload — a correctness and safety hazard.
   A plain HTML form POST gets the legacy redirect for free: the browser
   lands on the target user's studio home with a fully fresh page. The
   SPA never observes the transition.

2. **Sudo on assume_identity via the same require_sudo! helper**, added
   to the legacy action. This is the single deliberate exception to
   "don't touch legacy actions before decommission": impersonation is
   the highest-risk tool and shouldn't wait for its page to be the last
   one standing.

3. **AdminAuditEvent from the legacy action** (actor, target,
   request_id) alongside the existing log line, so impersonations are
   queryable with every other admin mutation despite not going through
   the API base controller. Implemented by calling the same audit model
   the around_action uses.

4. **StudioPerson merge/split are sudo-gated** (identity-destructive,
   hard to reverse); add_email is not. Firehose events keep flowing
   (analytics consumers unknown) — audit rows are additive.

## Risks / Trade-offs

- [Impersonated admin wanders back to /frontend-studio/admin] → the
  route gate sees the target user's AuthOutcome (almost never admin) and
  redirects away; if the target IS another admin, the audit trail still
  attributes the assume to the original actor at assume time. Session
  attribution during impersonation is a pre-existing property, unchanged.
- [Dual audit sinks for StudioPerson (Firehose + table)] → intentional;
  removing Firehose is a separate decision once its consumers are known.

## Migration Plan

Additive except the two-line hardening of assume_identity (sudo +
audit). That hardening ships first and alone within the change so it can
be verified against the legacy form before the SPA launch form flips.
Rollback = revert.

## Open Questions

- Does anything consume studio_person_audit Firehose events today?
  Answer determines whether decommission can eventually drop them.
