# Tasks: pegasus-cron-detach

Prerequisites: `pegasus-dead-code-sweep` and
`pegasus-core-ext-extraction` are merged (this change assumes the
dead oneoffs are gone and `poste.rb` explicitly requires
`cdo/object`). Verify both before starting.

## 1. Relocate Properties

- [ ] 1.1 Verify zero callers of the dead readers:
      `grep -rn "fetch_metrics\|fetch_hoc_metrics\|fetch_user_metrics\|fetch_project_count" --include=*.rb . --exclude-dir=.git`
      matches only `lib/cdo/pegasus/properties.rb` and its test
- [ ] 1.2 Create `lib/cdo/properties.rb` from
      `lib/cdo/pegasus/properties.rb`: remove the
      `DB = PEGASUS_DB` global (lines 3-5) and the four `fetch_*`
      class methods; change `@@table = DB[:properties]` to
      `@@table = PEGASUS_DB[:properties]` wrapped in
      `rubocop:disable/enable CustomCops/PegasusDbUsage`; keep
      `get`/`set`/`delete` and the 60s cache verbatim
- [ ] 1.3 Move `lib/test/cdo/pegasus/test_properties.rb` to
      `lib/test/cdo/test_properties.rb`; update its require to
      `cdo/properties`; trim tests of the removed `fetch_*` methods
- [ ] 1.4 Delete `lib/cdo/pegasus/properties.rb`

## 2. Detach the cron scripts

For each: verify the current require lines first (numbers drift).
"add deployment" means `require_relative '../../deployment'`
immediately after the `only_one` require (bin/cron scripts) — match
the existing style in `bin/cron/update_dotd:8`.

- [ ] 2.1 `bin/cron/update_dotd`: delete the src/env require (~:7);
      deployment already present (~:8)
- [ ] 2.2 `bin/cron/delete_twilio_data`: delete src/env (~:9); add
      deployment
- [ ] 2.3 `bin/cron/hoc_student_name_cleanup`: delete src/env (~:22);
      add deployment; `require 'cdo/pegasus/properties'` (~:26) →
      `require 'cdo/properties'`
- [ ] 2.4 `bin/cron/deliver_poste_messages_process.rb`: delete
      src/env (~:1); add `require_relative '../../deployment'` as the
      new first require
- [ ] 2.5 `bin/cron/geocode_hoc_activity`: delete src/env (~:8) and
      `require 'cdo/pegasus/src/database'` (~:9); add deployment,
      `require 'cdo/db'`, `require 'cdo/geocoder'`;
      `require 'cdo/pegasus/properties'` (~:10) →
      `require 'cdo/properties'`; replace `DB.fetch(` (~:20) and
      `DB[:hoc_activity]` (~:35) with `PEGASUS_DB.fetch(` /
      `PEGASUS_DB[:hoc_activity]`
- [ ] 2.6 `bin/cron/form_geos`: delete src/env (~:8); add deployment
- [ ] 2.7 `bin/cron/user_geos`: delete src/env (~:8); add deployment
- [ ] 2.8 `bin/cron/update_project_count`: delete src/env (~:12) and
      src/database (~:15); `cdo/pegasus/properties` (~:13) →
      `cdo/properties` (deployment already ~:16)
- [ ] 2.9 `bin/cron/hoc_signup_counts`: delete src/env (~:8); add
      deployment; `cdo/pegasus/properties` (~:11) → `cdo/properties`
- [ ] 2.10 `bin/upload_new_census_data_to_mapbox`:
      `require 'cdo/pegasus/properties'` (~:20) →
      `require 'cdo/properties'` (keeps its dashboard environment
      require)

## 3. Fix the pegasus Rakefile chain

- [ ] 3.1 `pegasus/Rakefile:1`:
      `require_relative '../lib/cdo/pegasus/src/env'` →
      `require_relative '../deployment'`
- [ ] 3.2 `pegasus/Rakefile` (~:46):
      `require 'cdo/pegasus/src/database'` → `require 'cdo/db'`
- [ ] 3.3 `pegasus/rake/db.rake`: replace the six bare `DB`
      references (~:31,32,56,64,70,71) with `PEGASUS_DB`

## 4. Delete the tree

- [ ] 4.1 Delete `lib/cdo/pegasus/src/env.rb` and
      `lib/cdo/pegasus/src/database.rb` (verify first:
      `grep -rn "src/env\|src/database" --include=*.rb . --exclude-dir=.git`
      matches nothing outside lib/cdo/pegasus/)
- [ ] 4.2 Delete `lib/cdo/pegasus.rb`, `lib/cdo/pegasus/array.rb`,
      `lib/cdo/pegasus/hash.rb`, `lib/cdo/pegasus/file_utility.rb`
      (verify: `grep -rn "require.*cdo/pegasus'" --include=*.rb .`
      and `grep -rn "cdo/pegasus/array\|cdo/pegasus/hash\|cdo/pegasus/file_utility" --include=*.rb .`
      return nothing)
- [ ] 4.3 Delete `lib/test/cdo/pegasus/test_array.rb`,
      `test_hash.rb`, `test_file_utility.rb`
- [ ] 4.4 Confirm `ls lib/cdo/pegasus/` lists exactly `graphics.rb`
      and `ls lib/test/cdo/pegasus/` lists exactly `test_graphics.rb`

## 5. Verify

- [ ] 5.1 `ruby -c` passes on all 10 edited bin scripts
- [ ] 5.2 `cd lib && bundle exec ruby -Itest test/cdo/test_properties.rb`
      passes
- [ ] 5.3 From repo root:
      `bundle exec ruby -e "require_relative 'deployment'; require 'cdo/properties'; puts Properties.respond_to?(:get)"`
      prints `true`
- [ ] 5.4 `cd pegasus && bundle exec rake -T` exits zero;
      `bundle exec rake db:version` prints a version (requires local
      pegasus dev DB; if absent run `bundle exec rake db:ensure_created db:migrate` first)
- [ ] 5.5 Drain-cron load check:
      `ruby -c bin/cron/deliver_poste_messages_process.rb` passes and
      `cd lib && bundle exec ruby -Itest test/test_deliverer.rb`
      passes
- [ ] 5.6 `grep -rn "cdo/pegasus" bin/ pegasus/ --include=* 2>/dev/null`
      returns nothing
- [ ] 5.7 `./tools/hooks/pre-commit` passes
