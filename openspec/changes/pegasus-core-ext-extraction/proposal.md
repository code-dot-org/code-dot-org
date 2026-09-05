# Pegasus Removal: Core-Ext Extraction

Change 2 of the pegasus removal series (`specs/pegasus-removal/plan.md`,
tier 1). Moves the live String and Object core-extensions out of
`lib/cdo/pegasus/` so the pegasus library tree can die.

## Why

Four methods defined under `lib/cdo/pegasus/` are load-bearing
production code wearing a dead project's namespace, reached today
through fragile require chains:

- `String#to_bool` — called by `dcdo_controller`, `levels_controller`,
  `Levels::FreeResponse`, `school_info_deduplicator`. This file is its
  ONLY definition (the in-file comment "May be provided by Rails" is
  wrong). Loaded into dashboard as a side effect of
  `Rack::Optimize`'s require.
- `String#include_one_of?` — used by `Rack::Optimize` and
  `Rack::ProcessHtml`/`Rack::UpgradeInsecureRequests`, both in the
  production Rack stack.
- `String#force_8859_to_utf8` — `dashboard/lib/certificate_image.rb`.
- `Object#nil_or_empty?` — used by ~10 dashboard controllers/concerns,
  `lib/cdo/poste.rb`, `dashboard/lib/projects_list.rb`, and
  `graphics.rb`. Loaded into dashboard ONLY via the
  `SharedResources → graphics.rb → object.rb` middleware require
  chain — the upcoming `pegasus-shared-resources-port` would silently
  remove the definition from the entire app.

Nothing else in the four umbrella files is live: `ends_with?`,
`squish`, `to_param`/`to_query`, `slice_keys`, `find_first_existing`,
`multiply_concat` are dead, ActiveSupport-superseded, or guarded
no-ops under Rails (audit in design.md).

## What Changes

- New `lib/cdo/string.rb` (`to_bool`, `include_one_of?`,
  `force_8859_to_utf8`) and `lib/cdo/object.rb` (`nil_or_empty?`),
  following the existing `lib/cdo/hash.rb` core-ext precedent.
  Method bodies byte-identical.
- Consumers gain explicit requires: `lib/cdo/rack/optimize.rb`,
  `lib/cdo/rack/process_html.rb`,
  `dashboard/lib/certificate_image.rb` (→ `cdo/string`);
  `lib/cdo/poste.rb`, `dashboard/lib/projects_list.rb`,
  `lib/cdo/pegasus/graphics.rb` (→ `cdo/object`).
- `dashboard/config/initializers/extensions.rb` requires both new
  files, so dashboard availability no longer depends on middleware
  require order.
- Delete `lib/cdo/pegasus/string.rb` and `lib/cdo/pegasus/object.rb`;
  remove their requires from the `lib/cdo/pegasus.rb` umbrella (the
  umbrella itself survives until `pegasus-cron-detach`); move/trim
  their tests.

## Capabilities

### New Capabilities

- `pegasus-core-ext-relocation`: the four live core-extensions are
  provided from `lib/cdo/{string,object}.rb` with unchanged behavior;
  nothing requires the pegasus paths.

### Modified Capabilities

_None._

## Impact

- New: `lib/cdo/string.rb`, `lib/cdo/object.rb`,
  `lib/test/cdo/test_string.rb`, `lib/test/cdo/test_object.rb`.
- Edited: 2 Rack middlewares, `certificate_image.rb`, `poste.rb`,
  `projects_list.rb`, `graphics.rb`,
  `dashboard/config/initializers/extensions.rb`,
  `lib/cdo/pegasus.rb`, `.config/rubocop/config.yml`.
- Deleted: `lib/cdo/pegasus/{string,object}.rb` + their tests.
- Runtime behavior identical; load order strictly widens.
- Unblocks: `pegasus-shared-resources-port` (no hidden
  `nil_or_empty?` dependency) and `pegasus-cron-detach` (umbrella
  shrinks to dead files only).
