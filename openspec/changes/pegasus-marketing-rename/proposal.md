# Pegasus Removal: Marketing-Config Rename

Change 12 of the pegasus removal series (`specs/pegasus-removal/plan.md`,
tier 5). Rename-only: retires the word "pegasus" from the config and
code that now describes the live code.org marketing site. No
behavior change; lowest priority in the series.

## Why

The name outlived the software. `CDO.pegasus_site_host`,
`override_pegasus`, `pegasus_hostname`, `pegasus_port`, the
`:pegasus` blocks in `lib/cdo/http_cache.rb` and
`lib/cdo/aws/cloudfront.rb`, and `hamburger.rb`'s
`show_pegasus_options` all configure the code.org marketing site
(Contentful) and its CloudFront distribution. Every future reader
must learn that "pegasus" here means "the marketing site, not the
dead Ruby app" — a permanent tax this change removes. Verified: the
`:pegasus` key is a Ruby symbol only; no CloudFormation logical ID
derives from it in-repo, so the rename cannot trigger CDN resource
replacement (alias lists and AWS-side names stay byte-identical).

## What Changes

Renames (old → new; `code_org` chosen to match the existing
`code_org_url` helper family):

- `CDO.pegasus_site_host` → `CDO.code_org_site_host` (lib/cdo.rb
  ~:143-145); `override_pegasus` → `override_code_org` (~:91 +
  config.yml.erb:445 + `bootstrap_chef_stack.sh.erb:136` +
  `dashboard/test/test_helper.rb:61,98`); `pegasus_hostname` →
  `code_org_hostname` (config.yml.erb:446 +
  bootstrap_chef_stack.sh.erb:108 + `cloudfront.rb:37`);
  `pegasus_port` → `code_org_port` (config.yml.erb:449 +
  lib/cdo.rb:133 + `application_helper_test.rb:57`); `pegasus_host`
  → `code_org_host` (config.yml.erb:447 + UI-test
  `steps.rb:73-75` env plumbing + `lib/cdo/url_converter.rb`
  pegasus_host param).
- `HTTP_CACHE[:pegasus]` → `HTTP_CACHE[:code_org]`
  (`http_cache.rb:144`) and `lib/cdo/aws/cloudfront.rb` `:pegasus`
  distribution key + the `:hourofcode → :pegasus` mapping
  (~:26-69,135,177,199,248) — Ruby-symbol renames; CloudFront
  `-pegasus-cdn` log prefix and `#{env}-pegasus.code.org` origin
  strings are AWS-side names and STAY (renaming them would move
  real resources; documented as accepted fossils).
- `hamburger.rb` `show_pegasus_options` → `show_code_org_options`
  (+ its consumer `dashboard/app/views/layouts/_header.html.haml`).
- `dashboard/config/application.rb:55` CORS origin uses the renamed
  helper.
- Cosmetic strings: `parent_letter.html.haml:27` `pegasusOrigin`
  local, `_unplug.html.haml:4-49` `has_pegasus_*` locals,
  `lib/cdo/google/drive.rb:160` 'Pegasus' sheet title (verify the
  sheet consumer tolerates the rename — if the gdrive export target
  sheet is externally named, keep and comment).
- Cookbooks: `cdo-apps` recipes drop pegasus from the
  `%w(dashboard pegasus)` loops (`default.rb:80`, `jemalloc.rb:3`),
  attributes drop the pegasus port block (`attributes/default.rb:12-15`),
  the teardown recipe `recipes/pegasus.rb` + its include
  (`default.rb:116`) are deleted (all production instances converged
  long since — verify with infra), `cdo-nginx/.kitchen.yml:18-19`
  drops the pegasus attribute.
- NOT renamed: DCDO keys `pegasus_*_max_age` (live runtime
  overrides; documented fossil), Gatekeeper `pegasus_read_replica`
  (live flag gating all pools), AWS-side names as above.

## Capabilities

### New Capabilities

- `marketing-config-naming`: the marketing-site configuration is
  addressable without the pegasus name; renames are alias-free and
  complete.

### Modified Capabilities

_None._

## Impact

- Pure rename across ~15 files + 2 chef templates + CFN bootstrap
  script; zero behavior change intended.
- Deploy coordination: config keys renamed in `config.yml.erb` must
  land together with the chef-node JSON writers
  (`bootstrap_chef_stack.sh.erb`) and any chef-managed globals that
  set the old keys (infra sweep task; stale old-name globals become
  inert).
- Needs an adhoc/staging converge + smoke before production.
