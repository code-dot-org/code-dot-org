# puma-alb-readiness

## Why

To remove nginx from the ALB-fronted serving path, Puma must first be able
to do the two jobs nginx does today: buffer slow request bodies and hold
keepalive connections longer than the ALB's idle timeout. This change makes
Puma ALB-ready while nginx continues to serve all traffic — a pure
preparation step with a trivial rollback, and the prerequisite for the
weighted-canary and cutover changes.

## What Changes

- `dashboard/config/puma.rb` stops setting `queue_requests false`
  (restoring Puma's default `true`). The reactor then buffers request
  bodies in-process, spooling large ones to tempfiles — the protection
  nginx's `proxy_request_buffering` provides today. Review invariant:
  `queue_requests` is never `false` on an instance without nginx in front.
- `dashboard/config/puma.rb` sets `persistent_timeout 75`, above the ALB's
  60-second idle timeout. Puma's 20-second default causes the classic
  intermittent-502 race when Puma is a direct ALB target.
- Puma additionally binds `tcp://0.0.0.0:9000` in ALB environments,
  alongside the existing unix socket. Port 9000 is the port the
  `FrontendSecurityGroup` already admits from the load balancer
  ("Forward HTTP requests directly to Dashboard Puma",
  `aws/cloudformation/vpc.yml.erb`). The TCP bind is gated by a new config
  key so adhoc (no ALB, internet-facing instance) is untouched.
- Nothing consumes the TCP bind yet; nginx and the unix socket remain the
  serving path until `alb-weighted-canary`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-http-serving`: adds requirements for slow-client request
  buffering at the app server, ALB-compatible keepalive timeout, and the
  dual-bind transition state.

## Impact

- `dashboard/config/puma.rb`: the three config changes above.
- `cookbooks/cdo-apps` / `cookbooks/cdo-nginx` attribute plumbing: a
  `dashboard_alb_port` (9000) config key set only where a load balancer
  exists, mirrored into cdo-secrets like `dashboard_sock` is today.
- Behavior change on live instances: `queue_requests true` re-enables
  keepalive handling between nginx and Puma over the unix socket
  (harmless; nginx defaults to `Connection: close` per proxied request),
  and Puma opens a listener on 9000 that only the ALB security group can
  reach.
