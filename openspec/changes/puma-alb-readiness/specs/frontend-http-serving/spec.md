# frontend-http-serving — delta for puma-alb-readiness

## ADDED Requirements

### Requirement: App server buffers slow request bodies
Puma SHALL run with `queue_requests` enabled (its default) so the reactor
thread buffers request bodies before dispatching to worker threads.
Configuration SHALL NOT set `queue_requests false` on any instance where
nginx is not proxying in front of Puma.

#### Scenario: Slow request body does not occupy a worker thread
- **WHEN** a client sends a request body slower than it can be processed
- **THEN** the reactor buffers the body (spooling large bodies to a tempfile)
- **THEN** a worker thread is dispatched only once the request is complete

### Requirement: Keepalive timeout exceeds the load balancer idle timeout
Puma SHALL hold persistent connections longer than the ALB idle timeout
(`persistent_timeout 75` against the ALB's 60 seconds).

#### Scenario: ALB reuses an idle keepalive connection
- **WHEN** the ALB reuses a target connection idle for up to 60 seconds
- **THEN** Puma has not closed it, and no 502 results

### Requirement: Dual-bind transition state in ALB environments
In environments with a load balancer, Puma SHALL bind both the existing
unix socket (serving nginx) and `tcp://0.0.0.0:9000`; in environments
without a load balancer Puma SHALL NOT open the TCP listener.

#### Scenario: ALB environment binds both listeners
- **WHEN** chef converges a load-balanced instance
- **THEN** Puma listens on the dashboard unix socket and on TCP 9000
- **THEN** nginx continues to serve all traffic via the socket

#### Scenario: Adhoc stays socket-only
- **WHEN** chef converges an adhoc (no load balancer) instance
- **THEN** Puma listens only on the unix socket behind nginx
