# request-body-limits — delta for rack-request-body-limit

## ADDED Requirements

### Requirement: Declared oversize requests are rejected unread
The origin SHALL reject any request whose `Content-Length` exceeds the
configured maximum body size with HTTP 413 before reading the request body.

#### Scenario: Content-Length above the cap
- **WHEN** a request declares `Content-Length` greater than `CDO.max_request_body_size`
- **THEN** the response is 413 and `rack.input` is never read

### Requirement: Undeclared body length is capped at read time
The origin SHALL enforce the same maximum on requests without a reliable
`Content-Length` (chunked or absent) by failing the request with 413 once
reads exceed the cap.

#### Scenario: Chunked body streams past the cap
- **WHEN** a chunked request body exceeds `CDO.max_request_body_size` mid-read
- **THEN** reading stops and the response is 413

### Requirement: Limit applies on every serving path
The cap SHALL be enforced identically whether the request arrived via
nginx or directly from the load balancer, and ahead of legacy middleware
routes (files API) as well as Rails routes.

#### Scenario: Request bypasses nginx
- **WHEN** an oversize request reaches Puma on the direct TCP listener
- **THEN** the same 413 behavior applies with no nginx in the path

#### Scenario: Legitimate large upload under the cap
- **WHEN** a request body is at or under the cap
- **THEN** the middleware passes it through unmodified
