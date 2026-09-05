# admin-user-lookup design

## Context

Legacy behavior lives in admin_search_controller.rb (find_students,
lookup_section, undelete_section — the undelete POST stays behind for
admin-user-lifecycle) and admin_users_controller.rb form actions that
look up a target user via User.from_identifier and render HAML tables.
Queries are ad-hoc in controller actions.

## Goals / Non-Goals

**Goals:**
- Faithful port of lookup semantics (same identifier forms accepted:
  id, email, hashed email, username, section code as applicable).
- Query logic extracted so JSON and legacy HAML actions share one
  implementation while both live.

**Non-Goals:**
- No mutations (undelete_section moves in admin-user-lifecycle).
- No new search capabilities beyond parity (no fuzzy search, paging
  upgrades only where trivial).

## Decisions

1. **Extract query objects** (e.g. Admin::StudentSearch,
   Admin::SectionLookup) called by both the new API controllers and the
   legacy actions, rather than having the API call the legacy controller
   or duplicate SQL. Cheapest route to behavior parity with one source
   of truth; legacy actions become thin renderers until deleted.

2. **Response shapes designed for the SPA, validated by Zod.** Flat JSON
   arrays/objects with explicit fields (no ActiveRecord as_json
   dumping); PII stays minimal (what the HAML tables already show,
   nothing more).

3. **Deleted records**: section lookup includes soft-deleted sections
   flagged `deleted: true` (parity with lookup_section's
   with_deleted behavior); user inspectors accept deleted users the same
   way the legacy forms do.

4. **Read-only endpoints emit no audit rows** (per admin-audit-log spec:
   mutating verbs only). Support staff browsing must not flood the audit
   table. If viewing-PII auditing is ever wanted, that is a deliberate
   later spec change.

## Risks / Trade-offs

- [Parity drift between JSON and HAML rendering] → both call the same
  query object; parity tests assert equivalent result sets for fixture
  users.
- [Large result sets (find_students on common names)] → cap + paginate
  as the legacy page does; same limits.

## Migration Plan

Additive endpoints + SPA pages; landing-page links flip from legacy to
SPA for these tools once verified. Legacy pages stay reachable until
admin-haml-decommission. Rollback = flip links back.

## Open Questions

- None blocking; identifier-form edge cases get pinned down in tests
  during implementation.
