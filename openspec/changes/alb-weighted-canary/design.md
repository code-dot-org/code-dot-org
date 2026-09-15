# alb-weighted-canary — design

## Context

After `puma-alb-readiness`, every LB-environment instance serves identical
traffic on two listeners: unix socket via nginx (port 80) and Puma direct
(port 9000). The ALB listener currently forwards 100% to the port-80
target group. ELBv2 listeners accept a `ForwardConfig` with up to five
weighted target groups; weights are integers and take effect immediately.

## Goals / Non-Goals

**Goals:**
- Percentage-based migration of live traffic nginx→direct with
  weight-change rollback (no deploy).
- Per-path observability: every ALB target-group metric splits the two
  serving paths for free.
- Explicit, testable gates before each ramp step.

**Non-Goals:**
- Removing nginx or changing the port-80 path (that is
  `alb-direct-cutover`, after the ramp holds at 100).
- Adhoc environments (no ALB; out of series scope).
- Automating the ramp; weight changes are deliberate operator actions.

## Decisions

- **Weighted target groups over a canary instance in the existing group.**
  A canary instance would mix paths within one target group, blinding the
  metrics split and requiring instance surgery to roll back. Weighted
  groups keep the fleet homogeneous — every instance serves both paths —
  and make the traffic split the only variable.
- **The new target group gets no `Name` property.** The existing group
  uses `!Ref AWS::StackName`, and stack names may legally use the entire
  32-character target-group name budget — any suffix scheme can overflow
  it. Let CloudFormation generate the name; nothing keys off target-group
  names (consumers use ARNs/Refs).
- **`TargetGroupStickinessConfig` on the ForwardConfig, duration 3600
  seconds**, so a client stays on one path for a session. Both paths are functionally
  identical, but pinning makes user-visible anomalies attributable to a
  path instead of smeared across both. The existing per-target-group
  lb_cookie stickiness (30s) is kept unchanged.
- **Health checks per target group on their own port.** The direct group
  health-checks 9000. An instance can be healthy-on-80 and
  unhealthy-on-9000 (or vice versa); the ALB only routes each path's
  traffic to targets healthy on that path — a free safety property during
  the ramp.
- **Initial template weights 100/0, ramp performed out-of-band.** The
  template encodes the safe state; operators move weights via CLI during
  the ramp and the final `alb-direct-cutover` change updates the template
  to the end state. Trade-off: a stack update mid-ramp resets weights to
  100/0 (fail-safe direction — traffic returns to nginx).

## Ramp gates (from the adversarial review)

Each step (1% → 10% → 50% → 100%) holds for at least one school-day peak
before the next, and requires:

- `HTTPCode_ELB_502_Count` and `TargetConnectionErrorCount` for the direct
  target group at or below the nginx group's rate (keepalive/
  `persistent_timeout` verification).
- Per-route 5xx-ratio Prometheus dashboards show no route regressing on
  the direct path.
- At 1%: manual checks — `/cable` websocket session established through
  the direct path and idled past 60s (ActionCable's 3s ping should hold
  the ALB idle timeout open); multi-MB files-api upload through the
  direct path (reactor buffering); `puma_worker_killer` rolling restart
  on one instance does not flap 9000 health checks (phased restart keeps
  the listener bound); a full `systemctl restart dashboard` shows the
  expected brief connection-refused on 9000 and recovery, mirroring
  today's 502-then-recover on 80.

## Risks / Trade-offs

- [Keepalive head-of-line blocking under real ALB connection reuse with
  threads 1..5] → the 1%/10% steps exist to surface this; mitigation
  knobs are Puma `max_keepalive_requests`/thread count before any further
  ramp.
- [Single-instance staging/test: full restart takes both paths down] →
  unchanged from today in duration; error flavor shifts from 502 to
  ALB 503. Verify deregistration delay is not adding drain time on 9000.
- [Operator forgets weights mid-ramp and a stack update reverts them] →
  reverts toward nginx (safe); ramp runbook says to re-apply.

## Migration Plan

Deploy the template (weights 100/0 — no traffic change), verify direct
target group reports healthy targets in staging/test, run the 1% gates in
staging, then production ramp 1 → 10 → 50 → 100. Hold at 100 for one
release cycle before starting `alb-direct-cutover`. Rollback at any point:
set direct weight to 0.
