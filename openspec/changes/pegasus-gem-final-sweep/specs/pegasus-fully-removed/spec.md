# pegasus-fully-removed

## ADDED Requirements

### Requirement: The sinatra gem is not in the bundle
The Gemfile SHALL NOT list `sinatra`, `Gemfile.lock` SHALL NOT
resolve it, and no code SHALL require `sinatra` or `cdo/sinatra`.

#### Scenario: bundle grep
- **WHEN** `grep -n "sinatra" Gemfile Gemfile.lock` runs
- **THEN** it returns no matches

#### Scenario: requires gone
- **WHEN** `grep -rn "require 'sinatra\|require \"sinatra\|cdo/sinatra" --include=*.rb --exclude-dir=.git .` runs
- **THEN** it returns no matches

#### Scenario: bundle resolves and dashboard boots
- **WHEN** `bundle install` and `bin/rails runner 'true'` (from dashboard/) run
- **THEN** both exit zero

### Requirement: Documentation describes the post-pegasus system
Repository documentation SHALL contain no instructions or
descriptions of the pegasus application, its tests, or its directory
(TESTING.md, README.md, CONTRIBUTING.md, SETUP.md, AGENTS.md, and
the docs/ files).

#### Scenario: docs grep
- **WHEN** `grep -rin "pegasus" README.md TESTING.md CONTRIBUTING.md SETUP.md AGENTS.md docs/ shared/css/README.md` runs
- **THEN** it returns no matches

### Requirement: The repo-wide pegasus grep matches only the fossil allowlist
A repo-wide case-insensitive grep for "pegasus" SHALL match only:
DCDO `pegasus_*_max_age` keys and their callsites, the Gatekeeper
`pegasus_read_replica` flag and its comment, retained AWS-side name
strings in `lib/cdo/aws/cloudfront.rb`, `openspec/` change archives,
and `specs/pegasus-removal/`.

#### Scenario: final gate
- **WHEN** `grep -ril "pegasus" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=openspec --exclude-dir=specs` runs at repo root
- **THEN** every matching file is on the fossil allowlist recorded in tasks.md, and each match within it is one of the allowlisted identifiers
