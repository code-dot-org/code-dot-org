# sinatra-port-file-transfer (delta)

Quota behavior of the shared transfer service, exercised for the first time
by non-sources buckets (sources bypass the app-size quota).

## ADDED Requirements

### Requirement: App size quota
The transfer service SHALL enforce, for quota-checked endpoint families on
writes and copies, the legacy 2 GB per-channel app-size cap: 403 with a
QuotaExceeded event (OpenTelemetry span attributes including quota type and
owner, per `FilesApi#record_event`) when the write would reach the cap, and a
one-time QuotaCrossedHalfUsed event when a write crosses half the cap.
`FileTooLarge` (413) SHALL record only the span metric, not the event.

#### Scenario: Crossing half quota
- **WHEN** a write moves a channel's app size from below to at-or-above 1 GB
- **THEN** the write succeeds and a QuotaCrossedHalfUsed event is recorded

#### Scenario: Copy checks quota
- **WHEN** a `?src=` copy would push the app size to the cap
- **THEN** the response is 403 and no copy occurs
