# pegasus-dead-code-removal

## ADDED Requirements

### Requirement: Dead pegasus executables are removed
The repository SHALL contain no executable scripts whose function
requires the deleted pegasus web server, deleted pegasus data files,
or completed one-time backfills. In particular `bin/pegasus-server`,
`bin/pegasus-console`, `bin/force-gsheet`, `bin/solr/update_document`,
the `*-hoc2016` ops scripts, and the dead oneoffs enumerated in
tasks.md SHALL be absent.

#### Scenario: server scripts gone
- **WHEN** `test -e bin/pegasus-server -o -e bin/pegasus-console` runs at repo root
- **THEN** it exits non-zero (neither file exists)

#### Scenario: no references to deleted scripts remain
- **WHEN** `grep -rn "pegasus-server\|pegasus-console\|force-gsheet" --exclude-dir=.git .` runs at repo root
- **THEN** it returns no matches in code or config (documentation of the removal itself excepted)

### Requirement: Caller-free gems are removed from the bundle
The Gemfile SHALL NOT list `rack_csrf`, `pdf-reader`, or `thin`, and
`Gemfile.lock` SHALL NOT resolve them.

#### Scenario: gems absent from Gemfile and lock
- **WHEN** `grep -n "rack_csrf\|pdf-reader\|^  thin\|gem .thin" Gemfile Gemfile.lock` runs
- **THEN** it returns no matches

#### Scenario: bundle still resolves
- **WHEN** `bundle install` runs after the removal
- **THEN** it completes without error

### Requirement: Dead pegasus config keys are removed
`config.yml.erb` and the per-env config files SHALL NOT define
`pegasus_honeybadger_api_key`, `pegasus_workers`, `pegasus_sock`, or
`pegasus_web_server_name`, and no code SHALL read them.

#### Scenario: keys absent
- **WHEN** `grep -rn "pegasus_workers\|pegasus_sock\|pegasus_web_server_name\|pegasus_honeybadger" config.yml.erb config/ lib/ dashboard/ bin/ cookbooks/ aws/` runs
- **THEN** it returns no matches

### Requirement: Dead library files and views are removed
The repository SHALL NOT contain `lib/cdo/languages.rb`,
`lib/cdo/pegasus/actionview_sinatra.rb`,
`lib/cdo/pegasus/screencap.rb`, `lib/cdo/pegasus/screencap.js`, their
tests, or
`dashboard/app/views/api/terms_interstitial_for_pegasus.html.haml`,
and Rails SHALL boot without them.

#### Scenario: no dangling requires
- **WHEN** `grep -rn "cdo/languages\|actionview_sinatra\|pegasus/screencap" lib/ dashboard/ bin/ shared/ pegasus/` runs
- **THEN** it returns no matches

#### Scenario: rails boots
- **WHEN** `bin/rails runner 'true'` runs from `dashboard/`
- **THEN** it exits zero
