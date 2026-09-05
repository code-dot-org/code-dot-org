# frontend-http-serving — delta for alb-direct-cutover

## ADDED Requirements

### Requirement: Load-balanced environments serve ALB-direct to Puma
In environments with a load balancer, the ALB SHALL forward to Puma's TCP
listener on port 9000 as the only serving path; nginx SHALL NOT be
installed or running on those instances.

#### Scenario: Request path on a production frontend
- **WHEN** a request arrives at the ALB for a load-balanced environment
- **THEN** it is forwarded to Puma on port 9000 with no intermediate proxy on the instance

#### Scenario: Health checks probe the serving port
- **WHEN** the ALB health-checks a target
- **THEN** it requests `/health_check` on port 9000 directly from Puma

### Requirement: Adhoc retains nginx as its TLS terminator
Environments without a load balancer (adhoc) SHALL continue to run nginx
with the provisioned certificate terminating TLS on :443 and proxying to
Puma's unix socket; Puma SHALL NOT expose a TCP listener there.

#### Scenario: Adhoc converge after the cutover
- **WHEN** chef converges an adhoc instance
- **THEN** nginx serves :80/:443 with the injected certificate, proxying to the dashboard unix socket
- **THEN** no Puma TCP port is open to the internet

### Requirement: The cutover ships as a single deployable unit
The cutover SHALL apply the listener collapse, the port-80 target-group
deletion, the first-boot health-check repoint, and the nginx cookbook
gating within one deploy window, so no intermediate state routes traffic
to or health-checks a port with no listener.

#### Scenario: Fleet stays healthy through the flip
- **WHEN** the cutover stack update and converge are applied
- **THEN** at no point do health checks probe a port with no listener
