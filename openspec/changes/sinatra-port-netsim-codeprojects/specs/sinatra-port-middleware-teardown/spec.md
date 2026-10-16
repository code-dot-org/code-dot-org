# sinatra-port-middleware-teardown

The end state of the port series: the dashboard Rack stack contains no
project Sinatra middleware.

## ADDED Requirements

### Requirement: No project Sinatra middleware in the stack
The application SHALL boot with no `FilesApi`, `ChannelsApi`, `NetSimApi`,
`AnimationLibraryApi`, or `SoundLibraryApi` entries in the Rails middleware
stack and no requires of their files; the Sinatra app files themselves SHALL
be deleted. `SharedResources` (separate engine) SHALL remain. Surviving
storage helpers (`projects.rb`, `bucket_helper.rb`, bucket classes,
`auth_helpers.rb`, `shared/middleware/helpers/*`) SHALL keep working for
their remaining consumers (ported controllers, `ReportAbuseController`),
loaded by explicit requires rather than by Sinatra app side effects.

#### Scenario: Stack audit
- **WHEN** `bin/rails runner 'puts Rails.configuration.middleware.map(&:name)'`
  runs after this change
- **THEN** none of the five Sinatra app class names appear and
  `SharedResources` still does

#### Scenario: Boot without Sinatra side-effect loads
- **WHEN** the test suite runs after the app files are deleted
- **THEN** `Projects`, the bucket classes, and the storage-id helpers resolve
  via explicit requires (no `NameError` from removed `load` side effects)

### Requirement: Legacy test scaffolding retired
The system SHALL delete the legacy Rack::Test scaffolding
(`files_api_test_base.rb`, `files_api_test_helper.rb`,
`middleware_test_helper.rb`, `spy_pub_sub_api.rb` if unused after the netsim
port) together with the last Sinatra app files, while keeping the helper
unit tests (`dashboard/legacy/test/middleware/helpers/`) that cover the
surviving storage classes, relocated or left in place per what they test.

#### Scenario: No orphaned test infrastructure
- **WHEN** the legacy middleware test directory is inspected after this
  change
- **THEN** every remaining file covers a class that still exists and runs
  green in CI
