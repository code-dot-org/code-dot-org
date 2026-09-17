# marketing-config-naming

## ADDED Requirements

### Requirement: Marketing-site config carries no pegasus identifiers
Code and repo config SHALL address the marketing site via
`code_org_*` identifiers (`code_org_site_host`, `override_code_org`,
`code_org_hostname`, `code_org_port`, `code_org_host`,
`HTTP_CACHE[:code_org]`, `show_code_org_options`), with the
documented fossils (DCDO `pegasus_*_max_age`, Gatekeeper
`pegasus_read_replica`, AWS-side resource names) as the only
remaining "pegasus" identifiers.

#### Scenario: rename grep
- **WHEN** `grep -rn "pegasus" --include=*.rb --include=*.erb --include=*.haml lib/cdo.rb lib/cdo/http_cache.rb lib/cdo/hamburger.rb lib/cdo/aws/cloudfront.rb config.yml.erb dashboard/config/application.rb dashboard/app/views/` runs
- **THEN** matches are only the documented fossils (DCDO max-age keys, the read-replica flag comment, AWS-side name strings)

### Requirement: Marketing links behave identically after the rename
`CDO.code_org_url` and the canonical-hostname logic SHALL produce
byte-identical URLs before and after the rename in every
environment configuration.

#### Scenario: url helper parity
- **WHEN** `CDO.code_org_url('/about')` is evaluated in development, test, and staging-config consoles
- **THEN** each output equals the pre-rename `code_org_url('/about')` output captured beforehand

#### Scenario: staging converge smoke
- **WHEN** staging converges with the renamed keys and the homepage renders
- **THEN** header hamburger marketing links, the CORS origin for /dashboardapi, and CloudFront invalidation tooling all function unchanged

### Requirement: Chef recipes carry no pegasus service management
The `cdo-apps` cookbook SHALL NOT contain the pegasus teardown
recipe, pegasus loop entries, or pegasus port attributes.

#### Scenario: cookbook grep
- **WHEN** `grep -rn "pegasus" cookbooks/cdo-apps/ cookbooks/cdo-nginx/` runs
- **THEN** it returns no matches
