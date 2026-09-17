# Design: pegasus-poste-dead-links

## Context

Verified call graph (2026-07-07):

```
Deliverer#send (poste.rb:230)
├─ Poste.encrypt_id(delivery[:id])          :232  ← only encrypt_id caller
├─ poste_url("/u/…") → unsubscribe_url      :234
│   ├─ template local :unsubscribe_link     :240  (never rendered —
│   │    'dashboard' is the only enqueued template; body-only)
│   ├─ "X-Unsubscribe-Web:" header          :274  ← SHIPS in every email
│   └─ "List-Unsubscribe: <…>" header       :275  ← SHIPS in every email
└─ poste_url("/o/…") → :tracking_pixel      :241  (never rendered)

Poste.unsubscribe        :89   callers: shared/test/test_poste.rb only
Poste.decrypt_id         :32   callers: none (the deleted /u/ endpoint)
Poste.encrypt/decrypt    :21,:37 callers: encrypt_id/decrypt_id + test
Poste2.find_or_create_url :379 callers: none (deleted click rewriter)
POSTE_BASE_URL/poste_url :218-221 callers: the two links only
CDO.poste_secret         only encrypt/decrypt keygen (:24,:42)
CDO.poste_host           only POSTE_BASE_URL (:218)
```

`storage_encrypt_id`/`storage_decrypt_id` in
`shared/middleware/helpers/storage_id.rb` are a DIFFERENT scheme
(channel cookies) — untouched.

`bin/cron/confirm_usage:22` `CREATED_CHECKS` includes
`[:forms, 60, PEGASUS_DB]`; production writes to `forms` ended with
the forms subsystem. The check writes an alert file consumed by the
monitoring wrapper — permanently red or ignored.

## Goals / Non-Goals

**Goals:**
- No dead URL construction, crypto, or url-table code in the send
  path; headers pointing at 404s stop shipping.
- `confirm_usage` checks only things that can pass.

**Non-Goals:**
- Re-serving unsubscribe (product decision: transactional-only mail).
- Honoring `contacts.unsubscribed_at` in the send path — it was
  never honored; changing send semantics is out of scope.
- Touching `poste_opens`/`poste_urls` tables (dropped in
  `pegasus-db-poste`).
- Any enqueue/drain/SMTP behavior beyond the two headers.

## Decisions

**1. Drop the `List-Unsubscribe` headers rather than fix them.**
The alternative (a dashboard `/u/` route) re-serves an unsubscribe
surface for mail that is, per product, transactional — and would
keep `contacts.unsubscribed_at` writes that nothing reads. If a
future marketing sender returns, it will not be Poste. Flagged as
THE user-visible behavior change of this change; deliverability
risk assessed low (List-Unsubscribe absence is normal for
transactional mail), but watch spam-rate metrics post-deploy.

**2. Delete `poste_secret`/`poste_host` config keys with their only
consumers.** Chef-managed production globals may still define them;
stale globals are inert (CDO ignores unknown keys) — note for the
infra cleanup in `pegasus-db-retire` to sweep globals.

**3. `confirm_usage` edit is minimal.** Remove one tuple from
`CREATED_CHECKS`; the KEY_VALUE_CHECKS and `poste_deliveries` backlog
check (:74-75) stay verbatim. Whether the alert is currently firing
in production is an ops question (flagged in tasks) but does not
change the edit.

## Risks / Trade-offs

- **Risk:** some mailbox provider scores transactional mail lower
  without List-Unsubscribe. Mitigation: the current header 404s,
  which is worse for reputation than absence; monitor bounce/spam
  rates after deploy.
- **Risk:** an out-of-repo consumer decrypts delivery ids with
  `poste_secret`. No evidence exists; the key stays defined in chef
  globals until `pegasus-db-retire`'s sweep, so recovery is a
  revert.
