# Tasks: pegasus-dead-code-sweep

Rule for every deletion: run the paired verification grep FIRST. If it
finds a live reference the inventory missed, skip that deletion, leave
the checkbox unchecked, and note the finding at the bottom of this
file. Do not chase new scope.

## 1. Dead executables

- [x] 1.1 Delete `bin/pegasus-server`, `bin/pegasus-console` (verify:
      `grep -rn "pegasus-server\|pegasus-console" --exclude-dir=.git . | grep -v Binary`
      shows only these files themselves and `lib/cdo/sequel.rb:98`'s
      stale comment, which task 6.2 fixes)
- [x] 1.2 Delete `bin/force-gsheet` (verify: no other reference;
      it reads the now-empty `pegasus/data/` and dead `seed_info`)
- [x] 1.3 Delete `bin/restart-pegasus-hoc2016`,
      `bin/restart-dashboard-and-pegasus-hoc2016`,
      `bin/check-memory-on-front-ends-hoc2016`
- [x] 1.4 Delete `bin/solr/update_document` (verify: gated on
      `CDO.solr_server` which no environment config sets; requires
      `cdo/pegasus/src/env`)
- [x] 1.5 Delete `bin/load-gift-codes`,
      `bin/k5-professional-development-survey-results`

## 2. Dead oneoff scripts (all under bin/oneoff/)

- [x] 2.1 Delete completed-migration scripts:
      `move_user_storage_ids_to_dashboard.rb` (NOTE: first copy it to
      `openspec/changes/pegasus-db-hoc/reference/` is NOT needed — the
      DB changes reference it from git history; plain delete),
      `move_storage_apps_to_dashboard`,
      `move_user_level_evaluations_to_student_work_evaluations.rb`
- [x] 2.2 Delete completed-backfill scripts under `backfill_data/`:
      `forms_hashed_email`, `form_geos`, `contacts_hashed_email`,
      `storage_apps_project_type_and_standalone`,
      `hoc_survey_prize_purpose`, `poste_deliveries_hashed_email`,
      `user_facilitator_bios.rb`
- [x] 2.3 Delete dead-table/dead-path scripts: `map-hoc-afterschool`,
      `send_missing_pd_workshop_surveys`, `wipe_data/young_emails`
      (require path already broken), `deprecate_unused_poste_urls.rb`,
      `lookup_hoc2016_robotics_prize_names`,
      `set_contained_level_results.rb`,
      `update_pd_workshop_survey_ids.rb`,
      `set_ai_tutor_available_for_csa_levels.rb`, `fix_on_form_bug`,
      `import_coderdojo_classes`, `hoc_student_name_initial_cleanup`,
      `drop_temp_views_from_pegasus`,
      `drop_forms_hoc_certificates_table`,
      `export_pardot_contacts.rb`, `import_concept_difficulty_tags.rb`
- [x] 2.4 Verify sweep: `grep -rln "cdo/pegasus/src/env" bin/oneoff/`
      returns nothing (all remaining oneoffs are src/env-free)

## 3. Dead library code

- [x] 3.1 Delete `lib/cdo/languages.rb`; remove
      `require 'cdo/languages'` from
      `dashboard/app/helpers/levels_helper.rb` (currently line 7;
      verify first that `Languages` appears nowhere in that file or in
      `dashboard/`, `lib/` outside the deleted file)
- [x] 3.2 Delete `lib/cdo/pegasus/actionview_sinatra.rb` and
      `lib/test/cdo/pegasus/test_actionview_sinatra.rb` (verify: only
      consumers are each other)
- [x] 3.3 Delete `lib/cdo/pegasus/screencap.rb`,
      `lib/cdo/pegasus/screencap.js`; remove
      `require_relative './pegasus/screencap'` from
      `lib/cdo/pegasus.rb` (verify: `generate_screencap` has zero
      callers outside screencap.rb)
- [x] 3.4 Delete
      `dashboard/app/views/api/terms_interstitial_for_pegasus.html.haml`
      (verify: `grep -rn "terms_interstitial_for_pegasus" dashboard/`
      returns only the file itself)

## 4. Gems

- [x] 4.1 Remove `gem 'rack_csrf'` + its comment (Gemfile ~line 76-77;
      verify `grep -rn "rack/csrf\|Rack::Csrf\|rack_csrf" --include=*.rb .`
      is empty)
- [x] 4.2 Remove `gem 'pdf-reader'` (Gemfile ~line 144; verify
      `grep -rn "pdf-reader\|PDF::Reader" --include=*.rb .` is empty)
- [x] 4.3 Remove `gem 'thin'` (Gemfile ~line 101; verify only caller
      was `bin/pegasus-server`, deleted in 1.1)
- [x] 4.4 Run `bundle install`; commit the `Gemfile.lock` diff (expect
      only removals; review for unexpected transitive changes)

## 5. Config keys

- [x] 5.1 Remove `pegasus_honeybadger_api_key` from `config.yml.erb`
      (~line 151), `config/test.yml.erb` (~line 26),
      `config/development.yml.erb` (~line 36). Extended to the two k8s
      suppliers that re-inject the key as a `CDO_*` env var, which
      `lib/cdo.rb` merges schema-free:
      `k8s/helm/templates/cdo-local-secrets.yaml` and
      `k8s/kustomize/components/backend/cdo-local-secret-overrides.env`.
- [x] 5.2 Remove `pegasus_workers` (~:451), `pegasus_sock` (~:448),
      `pegasus_web_server_name` (~:450) from `config.yml.erb`
- [x] 5.3 Verify: grep from the spec's "keys absent" scenario returns
      nothing

## 6. Infra references and stale comments

- [x] 6.1 Remove the pegasus project entry from
      `lib/cdo/honeybadger.rb` (~lines 99,105; project id 34365 in
      `get_recent_issues`)
- [x] 6.2 Fix stale comment `lib/cdo/sequel.rb:98-100` (references
      bin/pegasus-server)
- [x] 6.3 Remove the dead ELB deregistration code from
      `lib/cdo/server_tools.rb`. VERIFIED 2026-07-07 (read-only AWS
      check, account 475661607190, us-east-1): zero classic ELBs
      exist — `production-pegasus`, `production-dashboard`, and
      `production-redirects` are all gone, so the whole
      `deregister_frontends_internal` method (~:100-115) references
      nothing. Check its callers
      (`grep -rn "deregister_frontends" --include=*.rb lib/ bin/`);
      if caller-free, delete the method and its callers' dead
      branches; otherwise remove only the pegasus entry and note the
      rest as follow-up.
- [x] 6.4 Remove the dead `pegasus_dir` helper definition from
      `cookbooks/cdo-apps/templates/default/crontab.erb` (~lines
      30-31; verify no cron entry in the template body calls it)
- [x] 6.5 Remove `/.pegasus-built` and `/.pegasus-up-to-date` from
      `aws/.gitignore` (~lines 9-10; verify nothing writes these:
      `grep -rn "pegasus-built\|pegasus-up-to-date" --exclude-dir=.git .`).
      Extended to the same two entries in
      `k8s/docker/code-dot-org.dockerfile.dockerignore`, which is
      autogenerated from `aws/.gitignore` and must stay in sync.
- [x] 6.6 Remove the three "Pegasus Puma" port-9001 SG rule blocks
      from `aws/cloudformation/vpc.yml.erb` (~lines 143-147, 179-183,
      205-209); note in the PR that this is inert until the next VPC
      stack update
- [x] 6.7 Fix stale comments: `dashboard/lib/certificate_image.rb:2`
      (says pegasus_dir is required; it is not — the real dependency
      is `cdo/pegasus/string`, unchanged here), Gemfile ~lines 142 and
      150 ("for pegasus PDF generation" on `parallel_tests` /
      `open_uri_redirections`, both of which stay)

## 7. Verify

- [x] 7.1 `bin/rails runner 'true'` from `dashboard/` exits zero
- [x] 7.2 `./tools/hooks/pre-commit` passes
- [x] 7.3 Run every grep-gate scenario in
      `specs/pegasus-dead-code-removal/spec.md`; all return empty
- [x] 7.4 `bundle exec spring testunit ./test/helpers/levels_helper_test.rb`
      from `dashboard/` (exists? if not, run
      `bin/rails runner 'ApplicationController.helpers'` as a smoke
      check on levels_helper load)

## Implementation notes

Co-deleted one orphan the inventory did not list:
`bin/oneoff/poste_urls_constants.rb`. Its sole consumer was
`bin/oneoff/deprecate_unused_poste_urls.rb`, deleted by task 2.3.

Removed a dead revert instruction from
`bin/oneoff/bulk_load_bugcrowd_users`: it named a one-off deleted by
task 2.1. `bin/cron/hoc_student_name_cleanup` also mentions a deleted
one-off, but as a historical fact, so that comment stays as-is.

Task 5.1 was extended beyond the three config files. Two k8s manifests
supply `pegasus_honeybadger_api_key` as a `CDO_*` environment variable,
and `lib/cdo.rb` merges `CDO_*` variables without consulting the config
schema. Leaving them would resurrect the key after removal.

Task 6.5 was extended to
`k8s/docker/code-dot-org.dockerfile.dockerignore`. That file is
autogenerated from `aws/.gitignore`; the two `.pegasus-*` lines were
hand-edited rather than regenerated, because running the generator
would pull in unrelated drift.

The whole `ServerTools` class in `lib/cdo/server_tools.rb` is dead:
`grep -rn "ServerTools" --exclude-dir=.git .` finds only the class
definition itself. This change removes only the deregister path named
by task 6.3 (`deregister_frontends_internal`, the caller-free public
wrapper `deregister_frontends`, and the call site inside
`deprovision_frontends`). Deleting the remaining class is follow-up
work, out of scope here.

The 6.3 edit also updated `deprovision_frontends`'s doc comment and
confirmation prompt, which listed the removed deregister step.

Two rationales in the plan were wrong and are corrected here:

- Deleting `require 'cdo/languages'` does not shrink the Rails boot
  graph. `cdo/languages` did not drag `cdo/db` into boot; `cdo/db` is
  loaded via `cdo/poste` at `dashboard/config/application.rb:2`.
- Removing the pegasus PDF path does not free the `phantomjs` gem.
  `lib/pdf/collate.rb:1` still requires it.

Two asymmetries are accepted per design decision 6. Only the CSA
variant of `set_ai_tutor_available_for_*` is deleted; the CSP and
pilot variants stay. `import_concept_difficulty_tags.rb` is deleted
while `find_unseeded_level_concept_difficulty.rb` stays.
