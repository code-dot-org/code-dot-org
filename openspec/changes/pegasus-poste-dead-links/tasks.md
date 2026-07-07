# Tasks: pegasus-poste-dead-links

## 1. Strip the send path

- [ ] 1.1 In `Deliverer#send` (`lib/cdo/poste.rb` ~:230-245): remove
      `encrypted_id = Poste.encrypt_id(...)` (~:232),
      `unsubscribe_url = poste_url(...)` (~:234), and the
      `unsubscribe_link:`/`tracking_pixel:` entries from the params
      merge (~:240-241); keep `recipient:` and everything else
- [ ] 1.2 Remove the `X-Unsubscribe-Web:` and `List-Unsubscribe:`
      header lines (~:274-275)
- [ ] 1.3 Remove `POSTE_BASE_URL` and `def poste_url` (~:218-221)

## 2. Delete dead methods

- [ ] 2.1 Delete `Poste.unsubscribe` (~:85-113; verify callers first:
      only `shared/test/test_poste.rb`)
- [ ] 2.2 Delete `Poste.decrypt`, `Poste.encrypt`,
      `Poste.decrypt_id`, `Poste.encrypt_id` (~:21-52; verify the
      only remaining caller was 1.1's deleted line; do NOT touch
      `storage_encrypt_id`/`storage_decrypt_id` in
      `shared/middleware/helpers/storage_id.rb` — different scheme)
- [ ] 2.3 Delete `Poste2.find_or_create_url` (~:379-392; verify zero
      callers)
- [ ] 2.4 Delete the `if params.key?('form_id')` branch from
      `Poste::Template#render` (~:123-128) and `require 'cdo/form'`
      from `lib/cdo/poste.rb:3` (verify no other `Form2`/form usage
      remains in poste.rb; do NOT delete `lib/cdo/form.rb` — still
      required by `lib/cdo/pegasus/src/database.rb` until
      `pegasus-cron-detach`)
- [ ] 2.5 Trim `shared/test/test_poste.rb`: remove the unsubscribe
      tests (~:46-80) and encrypt/decrypt round-trip tests
      (~:95-110); keep everything exercising enqueue/recipient/
      template resolution

## 3. Config keys

- [ ] 3.1 Remove `poste_secret` from `config.yml.erb:347`,
      `config/adhoc.yml.erb:10`, `config/development.yml.erb:41`,
      `config/test.yml.erb:31` (verify no other consumer:
      `grep -rn poste_secret --include=*.rb lib/ dashboard/ bin/ shared/`)
- [ ] 3.2 Remove `poste_host` from `config.yml.erb:342` (verify only
      consumer was POSTE_BASE_URL)

## 4. confirm_usage

- [ ] 4.1 Remove the `[:forms, 60, PEGASUS_DB]` tuple from
      `CREATED_CHECKS` in `bin/cron/confirm_usage` (~:22); leave
      KEY_VALUE_CHECKS and the poste_deliveries backlog section
      untouched
- [ ] 4.2 Note for ops in the PR: check whether the forms freshness
      alert has been firing in production monitoring (it cannot have
      passed recently); this change silences it by removal

## 5. Verify

- [ ] 5.1 `cd lib && bundle exec ruby -Itest test/test_deliverer.rb`
      passes; add/adjust an assertion that the generated message
      contains no `List-Unsubscribe`, `X-Unsubscribe-Web`, `/u/`, or
      `/o/` content
- [ ] 5.2 `cd shared && bundle exec ruby -Itest test/test_poste.rb`
      passes
- [ ] 5.3 Grep gates from the spec all pass
- [ ] 5.4 `ruby -c bin/cron/confirm_usage` passes
- [ ] 5.5 End-to-end: from `dashboard/`,
      `bin/rails runner 'ActionMailer::Base.mail(to: "test@example.com", from: "noreply@code.org", subject: "t", body: "b").deliver_now'`
      enqueues without error (writes contacts + poste_deliveries),
      then `ruby -c` — do NOT run the drain against SMTP locally;
      the enqueue proves the edited send-path file loads
- [ ] 5.6 `./tools/hooks/pre-commit` passes
