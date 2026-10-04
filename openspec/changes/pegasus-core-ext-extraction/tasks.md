# Tasks: pegasus-core-ext-extraction

## 1. Create the new core-ext files

- [ ] 1.1 Create `lib/cdo/string.rb` in the style of `lib/cdo/hash.rb`:
      `class String` with `to_bool`, `include_one_of?`,
      `force_8859_to_utf8` copied byte-identical from
      `lib/cdo/pegasus/string.rb`, dropping the
      `unless method_defined?(:to_bool)` guard and its wrong comment;
      do NOT carry over `ends_with?`, `squish`, `squish!`,
      `multiply_concat` (design.md audit)
- [ ] 1.2 Create `lib/cdo/object.rb`: `class Object` with
      `nil_or_empty?` copied byte-identical from
      `lib/cdo/pegasus/object.rb`; do NOT carry over `to_param`,
      `to_query` (guarded no-ops under Rails; verify no non-Rails
      caller: `grep -rn "\.to_query(" --include=*.rb bin/ lib/cdo/poste.rb pegasus/` — the only hits must be Rails-loaded code)
- [ ] 1.3 Create `lib/test/cdo/test_string.rb` from
      `lib/test/cdo/pegasus/test_string.rb`, trimmed to the three
      surviving methods, requiring `cdo/string`
- [ ] 1.4 Create `lib/test/cdo/test_object.rb` from
      `lib/test/cdo/pegasus/test_object.rb`, trimmed to
      `nil_or_empty?`, requiring `cdo/object`

## 2. Repoint consumers

- [ ] 2.1 `lib/cdo/rack/optimize.rb:2`:
      `require 'cdo/pegasus/string'` → `require 'cdo/string'`
- [ ] 2.2 `lib/cdo/rack/process_html.rb:4`: same replacement
- [ ] 2.3 `dashboard/lib/certificate_image.rb:6`: same replacement
- [ ] 2.4 `lib/cdo/pegasus/graphics.rb:2`:
      `require 'cdo/pegasus/object'` → `require 'cdo/object'`
- [ ] 2.5 Add `require 'cdo/object'` near the top of
      `lib/cdo/poste.rb` (uses `nil_or_empty?` at ~line 408; today it
      relies on the cron's src/env umbrella load)
- [ ] 2.6 Add `require 'cdo/object'` near the top of
      `dashboard/lib/projects_list.rb` (uses `nil_or_empty?` at ~line
      193)
- [ ] 2.7 Add `require 'cdo/string'` and `require 'cdo/object'` as
      the first lines of `dashboard/config/initializers/extensions.rb`
- [ ] 2.8 In `lib/cdo/pegasus.rb`, remove only the
      `require_relative './pegasus/string'` and
      `require_relative './pegasus/object'` lines (verify current
      content first — the umbrella also requires `array`,
      `file_utility`, `hash`, which stay); do NOT delete the umbrella
      file

## 3. Delete the old files

- [ ] 3.1 Delete `lib/cdo/pegasus/string.rb` and
      `lib/cdo/pegasus/object.rb`
- [ ] 3.2 Delete `lib/test/cdo/pegasus/test_string.rb` and
      `lib/test/cdo/pegasus/test_object.rb`
- [ ] 3.3 Remove the `lib/test/cdo/pegasus/test_string.rb` exclude
      from `.config/rubocop/config.yml` (~line 27; verify exact entry)

## 4. Verify

- [ ] 4.1 `cd lib && bundle exec ruby -Itest test/cdo/test_string.rb`
      and `test/cdo/test_object.rb` pass
- [ ] 4.2 `bin/rails runner "puts 'true'.to_bool && ''.nil_or_empty?"`
      from `dashboard/` prints `true`
- [ ] 4.3 `bin/rails runner "puts 'ab'.include_one_of?('b')"` from
      `dashboard/` prints `true`
- [ ] 4.4 `grep -rn "pegasus/string\|pegasus/object" --include=*.rb --exclude-dir=.git .`
      returns nothing
- [ ] 4.5 Poste still loads standalone (simulates the drain cron
      without src/env's umbrella):
      `bundle exec ruby -e "require_relative 'deployment'; require 'cdo/poste'; puts Poste2.respond_to?(:send_message)"`
      from repo root prints `true`
- [ ] 4.6 `./tools/hooks/pre-commit` passes
