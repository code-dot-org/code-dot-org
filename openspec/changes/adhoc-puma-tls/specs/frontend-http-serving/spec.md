# frontend-http-serving — delta for adhoc-puma-tls

## MODIFIED Requirements

### Requirement: Adhoc retains nginx as its TLS terminator
Environments without a load balancer (adhoc) SHALL serve HTTPS with Puma
terminating TLS directly: `ssl_bind` on 0.0.0.0:443 using the provisioned
certificate (injected content or self-signed fallback), TLS 1.2 minimum,
plus plain HTTP on 0.0.0.0:80; nginx SHALL NOT be installed or running.

#### Scenario: HTTPS request to an adhoc
- **WHEN** a client requests https://<adhoc-host>/ on 443
- **THEN** Puma completes the TLS handshake with the provisioned certificate (TLS 1.2+) and serves the response with no intermediate proxy

#### Scenario: HTTP request to an adhoc
- **WHEN** a client requests http://<adhoc-host>/ on 80
- **THEN** Puma serves it directly (no redirect), matching prior nginx behavior

#### Scenario: Certificate rotation
- **WHEN** chef converges a changed certificate on an adhoc
- **THEN** the dashboard service restarts and Puma serves the new certificate

## ADDED Requirements

### Requirement: Privileged ports are granted narrowly
Puma's systemd unit SHALL include `AmbientCapabilities=CAP_NET_BIND_SERVICE`
only on nodes without a load balancer; load-balanced nodes SHALL NOT
receive the capability.

#### Scenario: LB node unit
- **WHEN** chef renders `puma.service` on a load-balanced node
- **THEN** the unit contains no AmbientCapabilities line

#### Scenario: Adhoc unit
- **WHEN** chef renders `puma.service` on a non-LB node
- **THEN** the unit grants exactly CAP_NET_BIND_SERVICE
