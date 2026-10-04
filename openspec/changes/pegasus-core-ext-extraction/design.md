# Design: pegasus-core-ext-extraction

## Context

`lib/cdo/pegasus/{string,object,hash,array,file_utility}.rb`
monkeypatch core classes. Full method audit (verified 2026-07-07):

| file | method | live callers | disposition |
|---|---|---|---|
| string.rb | `to_bool` | `dcdo_controller.rb:33`, `levels_controller.rb:179,199`, `levels/free_response.rb:53`, `school_info_deduplicator.rb:36-37`, dead `csv_to_sql_table.rb:54` | move |
| string.rb | `include_one_of?` | `lib/cdo/rack/optimize.rb:61`, `lib/cdo/rack/process_html.rb:69` | move |
| string.rb | `force_8859_to_utf8` | `dashboard/lib/certificate_image.rb:131` | move |
| string.rb | `ends_with?` | dead `csv_to_sql_table.rb:92`; ActiveSupport aliases it | drop |
| string.rb | `squish`/`squish!` | verbatim ActiveSupport copy | drop |
| string.rb | `multiply_concat` | only its test | drop |
| object.rb | `nil_or_empty?` | `poste.rb:408`, `projects_list.rb:193`, `graphics.rb:60-62`, `regional_partners_controller.rb:107`, `level_starter_assets_controller.rb:27`, `azure_text_to_speech.rb:46,60,72`, `sections_controller.rb:94`, more | move |
| object.rb | `to_param`, `to_query` | `unless method_defined?` guards → no-ops under Rails (AS defines them); no non-Rails caller | drop |
| hash.rb | `slice_keys` | zero callers | drop (file dies in pegasus-cron-detach) |
| hash.rb / array.rb | `to_param`/`to_query` | guarded no-ops | drop (same) |
| file_utility.rb | `find_first_existing` | zero callers | drop (same) |

The two `private def to_bool(val)` helpers in
`api/v1/amazon_future_engineer_controller.rb:100` and
`api/v1/users_controller.rb:414` are unrelated local methods; do not
touch.

Load chains today: `to_bool`/`include_one_of?` reach dashboard via
`application.rb` → `require lib/cdo/rack/optimize` →
`require 'cdo/pegasus/string'`. `nil_or_empty?` reaches dashboard via
`require 'shared_resources'` → `cdo/pegasus/graphics` →
`cdo/pegasus/object`. Crons get both via `src/env` →
`require 'cdo/pegasus'`.

## Goals / Non-Goals

**Goals:**
- The four live methods work from non-pegasus paths, identical
  behavior, with explicit requires replacing incidental load order.
- `lib/cdo/pegasus/{string,object}.rb` gone.

**Non-Goals:**
- Deleting `lib/cdo/pegasus.rb`, `array.rb`, `hash.rb`,
  `file_utility.rb` — the umbrella is still required by `src/env.rb`
  (production crons; `pegasus-cron-detach` owns it).
- Refactoring callers off monkeypatches. Parity move only.

## Decisions

**1. New homes `lib/cdo/string.rb` and `lib/cdo/object.rb`,**
mirroring the existing `lib/cdo/hash.rb` bare-core-ext precedent.
Rejected: `dashboard/lib/core_extensions.rb` (module-include
convention) as sole home — `lib/cdo/rack/*` and `lib/cdo/poste.rb`
are loaded by non-dashboard entrypoints and cannot require
dashboard/lib.

**2. Method bodies byte-identical, guards dropped.** The
`unless method_defined?` guards on `to_bool` are dead (no other
definition) and their comments wrong; the moved files define
unconditionally. `to_param`/`to_query` are NOT moved — under Rails
the guards already made them no-ops, and no non-Rails caller exists.

**3. Explicit require at every consumer file** plus
`dashboard/config/initializers/extensions.rb` requiring both
(that initializer already loads `lib/core_extensions`, making it the
canonical dashboard extension entry point). `graphics.rb`'s
`require 'cdo/pegasus/object'` becomes `require 'cdo/object'` so the
middleware keeps working until its port.

**4. Tests move to `lib/test/cdo/test_{string,object}.rb`,** trimmed
to the surviving methods; old rubocop exclude for
`lib/test/cdo/pegasus/test_string.rb` removed.

## Risks / Trade-offs

- **Risk:** an unaudited callsite uses a dropped method outside
  Rails. Mitigation: repo-wide greps in tasks for every dropped
  method name before deletion.
- **Risk:** a dashboard entrypoint that skips initializers calls
  `to_bool`/`nil_or_empty?`. Such an entrypoint is already broken
  today under the same conditions; the change only widens
  availability.
