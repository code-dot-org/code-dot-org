# sinatra-port-storage-identity

Storage-id resolution and channel ownership in Rails controller context.
Reference implementation: `shared/middleware/helpers/storage_id.rb`. The AES
channel-id encryption is an opaque dependency — the concern SHALL call the
existing shared helpers (`storage_encrypt_channel_id`,
`get_storage_id_and_project_id`, etc.) and SHALL NOT reimplement any
cryptography. The Sinatra originals call Rack/Sinatra APIs
(`response.set_cookie`, `request.shared_cookie_domain`) that differ on
ActionDispatch objects; this concern resolves that mismatch once, for all
ported controllers.

## ADDED Requirements

### Requirement: Storage id resolution
The system SHALL provide a controller concern whose `get_storage_id` resolves
in legacy order: the signed-in user's storage id from
`user_project_storage_ids` (created on demand), else the id decrypted from the
storage-id cookie, else a newly created anonymous storage id persisted via a
new cookie on the response.

#### Scenario: Signed-in user
- **WHEN** a signed-in user with an existing `user_project_storage_ids` row
  invokes an action calling `get_storage_id`
- **THEN** that row's id is returned and no storage-id cookie is written

#### Scenario: Anonymous user with cookie
- **WHEN** an anonymous request carries a valid storage-id cookie
- **THEN** `get_storage_id` returns the decrypted id without creating rows or
  rewriting the cookie

#### Scenario: Anonymous user without cookie
- **WHEN** an anonymous request has no storage-id cookie
- **THEN** a storage id is created and a storage-id cookie is set on the
  response

### Requirement: Storage id cookie byte compatibility
Storage-id cookies written by the concern SHALL be interchangeable with those
written by the Sinatra middleware: same environment-specific cookie name
(`storage_id_cookie_name`), same CGI-escaped `storage_encrypt_id` payload,
`domain` set to the shared cookie domain with leading dot (e.g. `.code.org`),
`path=/`, and 365-day expiry. A cookie written by either implementation SHALL
be readable by the other.

#### Scenario: Sinatra-written cookie readable
- **WHEN** a request carries a storage-id cookie produced by the legacy
  `create_storage_id_cookie`
- **THEN** the concern's `storage_id_from_cookie` returns the original id

#### Scenario: Rails-written cookie readable by legacy code
- **WHEN** the concern writes a storage-id cookie
- **THEN** the legacy Sinatra `storage_id_from_cookie` decrypts it to the same
  id

### Requirement: Channel ownership check
The system SHALL provide `owns_channel?(encrypted_channel_id)` matching legacy
semantics: true iff the channel id decrypts to a storage id equal to
`get_storage_id`. Decryption failures (`ArgumentError`,
`OpenSSL::Cipher::CipherError`) SHALL propagate to callers so each ported
endpoint can map them to its legacy status (usually 400).

#### Scenario: Owner
- **WHEN** `owns_channel?` is called with a channel id encrypted from the
  caller's own storage id
- **THEN** it returns true

#### Scenario: Malformed channel id
- **WHEN** `owns_channel?` is called with a string that is not a valid
  encrypted channel id
- **THEN** the decryption error propagates (no rescue inside the concern)
