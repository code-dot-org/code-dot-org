# puma-alb-readiness — design

## Context

`dashboard/config/puma.rb:23` sets `queue_requests false` with the comment
"nginx already buffers/queues requests so disable Puma's own queue." That
line is why nginx is currently load-bearing: without the reactor, a client
that dribbles a request body occupies one of only five threads per worker
for the whole upload. nginx's full-request buffering makes that safe today.
The ALB does not buffer request bodies, so direct-to-ALB serving needs the
reactor back.

Separately, Puma's default `persistent_timeout` (20s) is below the ALB
idle timeout (60s): the ALB can reuse a keepalive connection Puma has just
closed, surfacing as intermittent 502s. Target keepalive must exceed the
LB's idle timeout.

Puma 7.2 supports multiple `bind` calls; the master process holds all
listeners and forked workers share the accept queues.

## Goals / Non-Goals

**Goals:**
- Puma is a valid direct ALB target on port 9000, verified reachable from
  the ALB security group, while nginx still serves 100% of traffic.
- The buffering invariant is explicit: `queue_requests` true wherever
  nginx is absent (and, after this change, everywhere).

**Non-Goals:**
- Routing any traffic to the TCP bind (that is `alb-weighted-canary`).
- Changing the ALB target group, health checks, or security groups.
- Any adhoc-environment change: adhoc has no ALB and nginx is its TLS
  front door; the TCP bind is not enabled there.

## Decisions

- **New config key `dashboard_alb_port` (9000) rather than reusing
  `dashboard_port` (8080).** Reasons: (a) the FrontendSecurityGroup only
  admits 9000/9001 from the LB — 8080 is firewalled; (b) nginx's
  `dashboard_proxy` server block already listens on `dashboard_port`, so
  reusing it would make nginx and Puma race for the same port during the
  dual-bind window; (c) a separate key lets chef enable the bind per
  environment exactly like `dashboard_sock` is set today
  (`cookbooks/cdo-nginx/recipes/default.rb` `node.override` pattern).
- **Gate the TCP bind on the config key, set only in LB environments.**
  On adhoc the instance is internet-facing with a public IP; an ungated
  `0.0.0.0:9000` listener would be a new plaintext exposure. Adversarial
  review, blocker 1.
- **`persistent_timeout 75`.** ALB idle timeout is 60s (default, and no
  override found in `cloud_formation_stack.yml.erb`); 75 gives a 15s
  margin. Applied unconditionally — it is harmless behind nginx.
- **Restore `queue_requests` by deleting the override, not by setting
  `true` conditionally.** One code path, no per-env matrix. The unix-socket
  path tolerates the reactor fine.

## Risks / Trade-offs

- [Reactor buffers large uploads to Puma tempfiles on the instance disk
  instead of nginx temp files] → same disk, same instance, bounded memory;
  the request-size cap arrives in `rack-request-body-limit` before any
  traffic bypasses nginx.
- [Keepalive head-of-line blocking in Puma behind an ALB multiplexing many
  requests onto few connections with threads 1..5] → not triggered while
  nginx serves traffic; measured under the weighted canary before ramp-up.
- [Port 9000 already in use on some instance] → 9000/9001 were reserved
  for exactly this in the VPC security groups; verify with `ss -ltn`
  during staging converge.

## Migration Plan

Chef converge restarts the dashboard service (the existing
`dashboard_listeners` file resource already restarts Puma when
socket/port config changes). Rollback: revert the commit and converge;
Puma returns to socket-only.

## Open Questions

- Whether the ALB idle timeout is anywhere overridden outside this repo
  (console drift). Check the live ALB attribute before the canary change;
  the 75s value only needs to exceed the real setting.
