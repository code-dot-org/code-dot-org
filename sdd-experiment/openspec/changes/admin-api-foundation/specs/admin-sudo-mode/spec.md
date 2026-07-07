# admin-sudo-mode

## ADDED Requirements

### Requirement: Destructive endpoints require fresh re-authentication
Endpoints declaring `require_sudo!` SHALL be rejected with 403
`{error: "sudo_required"}` unless `session[:admin_sudo_at]` is within the
freshness window (default 15 minutes, DCDO-tunable), without executing
the action.

#### Scenario: Stale sudo stamp
- **WHEN** an admin whose sudo stamp is older than the window calls a
  sudo-gated endpoint
- **THEN** the response is 403 `{error: "sudo_required"}` and no state
  changes

#### Scenario: Fresh sudo stamp
- **WHEN** an admin re-authenticated within the window calls a sudo-gated
  endpoint
- **THEN** the action executes normally

### Requirement: Sudo stamp set only by fresh re-authentication
The system SHALL set `session[:admin_sudo_at]` only after the admin
completes a fresh Google OAuth re-authentication (admins are SSO-only,
passwordless); no API endpoint may set it from a client-supplied value.

#### Scenario: Re-auth completion
- **WHEN** an admin completes the sudo re-auth flow
- **THEN** `session[:admin_sudo_at]` is set server-side to the current
  time

#### Scenario: Client cannot self-grant
- **WHEN** a request attempts to supply a sudo timestamp as a parameter
- **THEN** it has no effect on the session stamp
