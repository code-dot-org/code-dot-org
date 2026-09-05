# pegasus-core-ext-relocation

## ADDED Requirements

### Requirement: Live String extensions are provided from lib/cdo/string.rb
`lib/cdo/string.rb` SHALL define `String#to_bool`,
`String#include_one_of?`, and `String#force_8859_to_utf8` with
behavior identical to the former `lib/cdo/pegasus/string.rb`
definitions.

#### Scenario: to_bool truthy, falsy, and error cases
- **WHEN** `'Yes'.to_bool`, `'0'.to_bool`, and `'maybe'.to_bool` are evaluated with only `cdo/string` required
- **THEN** they return `true`, return `false`, and raise `ArgumentError` respectively

#### Scenario: include_one_of? matches any needle
- **WHEN** `'abcdef'.include_one_of?('xyz', 'cde')` is evaluated
- **THEN** it returns `true`

#### Scenario: force_8859_to_utf8 converts invalid UTF-8
- **WHEN** a string containing ISO-8859-1 bytes invalid in UTF-8 receives `force_8859_to_utf8`
- **THEN** the result is valid UTF-8, and already-valid UTF-8 strings pass through unchanged

### Requirement: Object#nil_or_empty? is provided from lib/cdo/object.rb
`lib/cdo/object.rb` SHALL define `Object#nil_or_empty?` returning
true for nil and for objects whose `empty?` is true.

#### Scenario: nil, empty, and non-empty receivers
- **WHEN** `nil.nil_or_empty?`, `''.nil_or_empty?`, and `'x'.nil_or_empty?` are evaluated with only `cdo/object` required
- **THEN** they return `true`, `true`, and `false` respectively

### Requirement: The pegasus string and object paths are gone
The repository SHALL NOT contain `lib/cdo/pegasus/string.rb` or
`lib/cdo/pegasus/object.rb`, and no file SHALL require
`cdo/pegasus/string` or `cdo/pegasus/object`.

#### Scenario: grep gate
- **WHEN** `grep -rn "pegasus/string\|pegasus/object" --include=*.rb --exclude-dir=.git .` runs at repo root
- **THEN** it returns no matches

### Requirement: Dashboard availability is independent of middleware require order
`dashboard/config/initializers/extensions.rb` SHALL require
`cdo/string` and `cdo/object`, making all four extensions available
to dashboard code at boot regardless of which middleware loads.

#### Scenario: extensions available in a bare runner
- **WHEN** `bin/rails runner "puts 'true'.to_bool && ''.nil_or_empty?"` runs from `dashboard/`
- **THEN** it prints `true` and exits zero
