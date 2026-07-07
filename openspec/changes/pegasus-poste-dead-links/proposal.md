# Pegasus Removal: Poste Dead-Link Machinery

Change 5 of the pegasus removal series (`specs/pegasus-removal/plan.md`,
tier 1). Deletes the marketing-era unsubscribe/tracking machinery
from the email pipeline and fixes the broken `confirm_usage` check.

## Why

The pegasus server that served `/u/<id>` (unsubscribe) and `/o/<id>`
(tracking pixel) is deleted, but `lib/cdo/poste.rb` still carries the
whole apparatus: per-send AES encryption of delivery ids, URL
construction, `Poste.unsubscribe` (no callers outside its test),
`Poste2.find_or_create_url` (click rewriting; no callers), and the
`poste_urls` table plumbing. Body templates never render the links
(the only enqueued template, `dashboard`, interpolates body+header
fields only) — but two SMTP headers DO ship in every sent email:
`List-Unsubscribe:` and `X-Unsubscribe-Web:` (`poste.rb:274-275`),
pointing at the dead URL. Mail clients (Gmail's native Unsubscribe
button) surface that header; clicking it 404s today.

Separately, the production `confirm_usage` cron (every minute)
asserts a `forms` row was created in the last 60 minutes — nothing
has written `forms` since the forms subsystem was retired, so the
check is permanently failing or its alerting is dead.

Product decision (2026-07-07, user): all Poste email is
transactional; marketing email left Poste. Therefore the unsubscribe
surface is removed rather than re-served.

## What Changes

- **Behavior change (the one in this series):** sent emails lose the
  `List-Unsubscribe:` and `X-Unsubscribe-Web:` headers, which today
  point at a URL that 404s. Mail clients stop showing a native
  unsubscribe affordance for these transactional emails.
- `Deliverer#send` stops computing `encrypted_id`,
  `unsubscribe_url`, `unsubscribe_link:`, `tracking_pixel:` (the
  template locals were never rendered).
- Delete `Poste.unsubscribe`, `Poste.encrypt`/`decrypt`/
  `encrypt_id`/`decrypt_id`, `poste_url`/`POSTE_BASE_URL`,
  `Poste2.find_or_create_url` — each verified caller-free after the
  above (tests of deleted methods trim with them).
- Remove config keys orphaned by the deletions: `poste_secret` (AES
  key; only the deleted encrypt/decrypt used it) and `poste_host`
  (only `POSTE_BASE_URL` used it).
- Delete the dead `form_id` branch in `Poste::Template#render`
  (~:123-128) and poste's `require 'cdo/form'` — form-rendered
  emails were a marketing-era feature; no producer enqueues
  `form_id` params, and the queue drains in minutes so no legacy
  rows exist. (`lib/cdo/form.rb` itself is deleted by
  `pegasus-db-forms-drop` once its last requirer dies.) This also
  unblocks `pegasus-db-poste`'s blanket `POSTE_DB` repoint — the
  branch reads the `forms` table, which does not move.
- `bin/cron/confirm_usage`: remove the `[:forms, 60, PEGASUS_DB]`
  freshness check; the `poste_deliveries` backlog check stays.

## Capabilities

### New Capabilities

- `poste-transactional-only`: the email pipeline emits no
  unsubscribe/tracking URLs and carries no dead crypto/url-table
  machinery.

### Modified Capabilities

_None._

## Impact

- `lib/cdo/poste.rb`: ~90 lines deleted; enqueue/drain/send behavior
  otherwise identical.
- `shared/test/test_poste.rb`: unsubscribe/encrypt/url tests removed.
- `bin/cron/confirm_usage`: one tuple removed.
- `config.yml.erb` + env configs: `poste_secret`, `poste_host`
  removed.
- `poste_urls` table loses its last code reference (dropped in
  `pegasus-db-poste`).
- Sequencing: lands before `pegasus-db-poste` (shrinks the surface
  that migration must repoint).
