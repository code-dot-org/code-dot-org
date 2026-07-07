# Tasks: pegasus-marketing-rename

Standalone; may land any time after `pegasus-dead-code-sweep`.
Lowest priority of the series.

## 1. Pre-work gates

- [ ] 1.1 HUMAN GATE (infra): sweep chef-managed globals for
      environments setting `override_pegasus`, `pegasus_hostname`,
      `pegasus_port`, `pegasus_host`; list them in the PR and plan
      the coordinated rename of those globals
- [ ] 1.2 HUMAN GATE (infra): confirm all production/staging
      instances have converged since `cdo-apps::pegasus` (teardown
      recipe) landed, clearing its deletion
- [ ] 1.3 Capture parity baselines:
      `bin/rails runner 'puts CDO.code_org_url("/about")'` output per
      env config, saved for 4.2

## 2. Code renames

- [ ] 2.1 `lib/cdo.rb`: `pegasus_site_host` → `code_org_site_host`
      (~:143-145), `override_pegasus` → `override_code_org` (~:91),
      `pegasus_port` → `code_org_port` (~:133); update the ~57
      `code_org_url` callsites only if signatures change (they do
      not — rename is internal)
- [ ] 2.2 `config.yml.erb`: rename keys at ~:445-451
      (`override_pegasus`, `pegasus_hostname`, `pegasus_host`,
      `pegasus_port`) and the `allowed_iframe_ancestors` embed
      (~:374) referencing `pegasus_site_host`
- [ ] 2.3 `aws/cloudformation/bootstrap_chef_stack.sh.erb`
      (~:17-18,108,136): rename the written node-JSON keys +
      `PEGASUS_DOMAIN_NAME` shell var
- [ ] 2.4 `lib/cdo/http_cache.rb` (~:144): `pegasus:` → `code_org:`;
      `lib/cdo/aws/cloudfront.rb`: `:pegasus` key + `:hourofcode`
      mapping (~:26-69,135,177,199,248) — leave the `-pegasus-cdn`
      log-prefix and `#{env}-pegasus.code.org` origin STRINGS
      untouched (AWS-side names; add a one-line comment saying so)
- [ ] 2.5 `lib/cdo/hamburger.rb`: `show_pegasus_options` →
      `show_code_org_options` (all ~8 sites) + consumer in
      `dashboard/app/views/layouts/_header.html.haml`
- [ ] 2.6 `dashboard/config/application.rb` (~:55): CORS origin uses
      `CDO.code_org_site_host`
- [ ] 2.7 `dashboard/test/test_helper.rb` (~:61,98) and
      `dashboard/test/helpers/application_helper_test.rb` (~:57):
      renamed keys
- [ ] 2.8 `lib/cdo/url_converter.rb`: `pegasus_host:` param →
      `code_org_host:`; `dashboard/test/ui/features/step_definitions/steps.rb`
      (~:73-75): read `CODE_ORG_TEST_DOMAIN` with fallback to
      `PEGASUS_TEST_DOMAIN` (design.md decision 4; note the
      follow-up to drop the fallback once drone config is updated)
- [ ] 2.9 Cosmetic: `parent_letter.html.haml` (~:27)
      `pegasusOrigin` → `codeOrgOrigin` (check the JS consumer of
      `script_data` in the corresponding entrypoint and rename
      there too); `_unplug.html.haml` (~:4-49) `has_pegasus_*`
      locals → `has_code_org_*`; `lib/cdo/google/drive.rb` (~:160)
      'Pegasus' sheet title — verify whether the target spreadsheet
      tab is externally named; rename only if repo-controlled, else
      comment

## 3. Cookbooks

- [ ] 3.1 `cookbooks/cdo-apps/recipes/default.rb` (~:80):
      `%w(dashboard pegasus)` → `%w(dashboard)`; (~:116) remove
      `include_recipe 'cdo-apps::pegasus'`
- [ ] 3.2 Delete `cookbooks/cdo-apps/recipes/pegasus.rb` (post 1.2)
- [ ] 3.3 `cookbooks/cdo-apps/recipes/jemalloc.rb` (~:3): drop
      pegasus from the loop
- [ ] 3.4 `cookbooks/cdo-apps/attributes/default.rb` (~:12-15):
      remove the pegasus port-8081 block
- [ ] 3.5 `cookbooks/cdo-nginx/.kitchen.yml` (~:18-19): remove the
      pegasus attribute; clean comment-only mentions in
      `logrotate.rb`, `puma.service.erb`, serverspec files
- [ ] 3.6 Bump the cdo-apps cookbook version per cookbook conventions
      (check how other recipe changes version)

## 4. Verify

- [ ] 4.1 Spec grep gates pass (fossils only)
- [ ] 4.2 Parity: re-run 1.3 commands; outputs identical
- [ ] 4.3 From `dashboard/`: `bundle exec spring testunit
      ./test/helpers/application_helper_test.rb` + boot smoke
- [ ] 4.4 `./tools/hooks/pre-commit` passes
- [ ] 4.5 HUMAN GATE: adhoc or staging converge + smoke (homepage
      hamburger marketing links, /dashboardapi CORS from the
      marketing origin, `rake infra:flush_cloudfront_cache` dry
      path) before production deploy window
