# poste-transactional-only

## ADDED Requirements

### Requirement: Sent emails carry no unsubscribe or tracking URLs
Emails delivered by the Poste drain SHALL NOT contain
`List-Unsubscribe` or `X-Unsubscribe-Web` headers, and the rendered
message SHALL NOT reference `/u/` or `/o/` poste URLs anywhere.

#### Scenario: delivered message headers
- **WHEN** a queued delivery is sent through `Deliverer#send` in a test harness
- **THEN** the generated RFC message contains no `List-Unsubscribe` and no `X-Unsubscribe-Web` header and no `code.org/u/` or `code.org/o/` substring

### Requirement: Dead unsubscribe and URL-tracking code is removed
`lib/cdo/poste.rb` SHALL NOT define `Poste.unsubscribe`,
`Poste.encrypt`, `Poste.decrypt`, `Poste.encrypt_id`,
`Poste.decrypt_id`, `poste_url`, `POSTE_BASE_URL`, or
`Poste2.find_or_create_url`.

#### Scenario: grep gate
- **WHEN** `grep -n "unsubscribe\|encrypt\|decrypt\|poste_url\|POSTE_BASE_URL\|find_or_create_url\|form_id\|Form2" lib/cdo/poste.rb` runs
- **THEN** it returns no matches

#### Scenario: send path works without them
- **WHEN** `cd lib && bundle exec ruby -Itest test/test_deliverer.rb` runs
- **THEN** all tests pass

### Requirement: Orphaned poste config keys are removed
`config.yml.erb` and env config files SHALL NOT define `poste_secret`
or `poste_host`.

#### Scenario: keys absent
- **WHEN** `grep -rn "poste_secret\|poste_host" config.yml.erb config/ lib/ dashboard/ bin/` runs
- **THEN** it returns no matches

### Requirement: confirm_usage checks only live writers
`bin/cron/confirm_usage` SHALL NOT assert freshness of the pegasus
`forms` table; its `poste_deliveries` backlog check SHALL remain.

#### Scenario: forms tuple gone, backlog check present
- **WHEN** `grep -n "forms\|poste_deliveries" bin/cron/confirm_usage` runs
- **THEN** it matches `poste_deliveries` and does not match a `:forms` check
