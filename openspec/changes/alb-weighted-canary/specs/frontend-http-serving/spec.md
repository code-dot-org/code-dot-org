# frontend-http-serving — delta for alb-weighted-canary

## ADDED Requirements

### Requirement: Traffic splits across nginx and direct paths by weight
The ALB listeners SHALL forward to two target groups — nginx (port 80)
and Puma direct (port 9000) — with operator-adjustable weights, defaulting
to 100% nginx. Weight changes SHALL take effect without redeploying or
converging instances.

#### Scenario: Initial deploy changes no traffic
- **WHEN** the weighted-forward template first deploys
- **THEN** weights are nginx=100, direct=0 and all traffic flows as before

#### Scenario: Instant rollback
- **WHEN** an operator sets the direct target group weight to 0 mid-ramp
- **THEN** all new requests flow through nginx within the listener update propagation, with no deploy

### Requirement: Each serving path is independently health-checked
The direct target group SHALL health-check `/health_check` on port 9000
so a path-specific failure removes an instance only from that path.

#### Scenario: Direct listener down, nginx up
- **WHEN** an instance's 9000 listener fails health checks while 80 passes
- **THEN** the instance receives only nginx-path traffic

### Requirement: Clients are pinned to one path per session
The weighted forward SHALL use target-group stickiness so a client stays
on a single serving path for the stickiness duration.

#### Scenario: Session stays on one path
- **WHEN** a client makes multiple requests during a canary ramp
- **THEN** all requests within the stickiness window use the same target group

### Requirement: Ramp steps are gated on path-split metrics
Each traffic-weight increase SHALL require the direct path's ALB 502 and
target-connection-error rates to be at or below the nginx path's, no
per-route 5xx regression, and (at first ramp) verified websocket, large
upload, and restart behavior through the direct path.

#### Scenario: Direct path regresses during ramp
- **WHEN** the direct target group shows elevated 502s or per-route 5xx versus the nginx group
- **THEN** the ramp halts and the direct weight returns to 0 pending diagnosis
