# alb-weighted-canary

## Why

Cutting the fleet from nginx to direct-Puma in one step is an
all-or-nothing re-registration with a redeploy-sized rollback. The ALB
supports weighted forwarding across target groups, which turns the same
migration into a dial: both paths run simultaneously on the same
instances, traffic shifts by percentage, and rollback is dragging a weight
back to zero — seconds, no deploy, no chef converge. This change builds
the dial and defines the validation gates for turning it.

## What Changes

- New `ALBTargetGroupDirect` in `aws/cloudformation/cloud_formation_stack.yml.erb`:
  protocol HTTP, port 9000, health check `/health_check` on 9000, same
  round_robin/stickiness/slow_start attributes as the existing group.
- Frontend ASG registers in both target groups
  (`frontend_properties.TargetGroupARNs`); non-frontend environments add
  the daemon as an explicit target on 9000 (the existing group's
  `Targets: [{Id: daemon, Port: 80}]` pattern).
- HTTP and HTTPS listener default actions become
  `ForwardConfig` with two weighted target groups, initial weights
  nginx=100 / direct=0. `TargetGroupStickinessConfig` pins a client to one
  path for the session so users do not alternate proxies mid-flow.
- A documented ramp-and-validate playbook (1% → 10% → 50% → 100%) with
  the adversarial review's checks as gates.
- Sequencing: requires `puma-alb-readiness` converged (9000 listener up)
  and `rack-request-body-limit` soaked in production.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-http-serving`: adds the dual-target-group weighted routing
  state and its validation gates.

## Impact

- `aws/cloudformation/cloud_formation_stack.yml.erb`: new target group,
  listener `DefaultActions` restructure, ASG/daemon target registration.
- No cookbook changes; instances already serve both paths after
  `puma-alb-readiness`.
- Operational: weight changes are console/CLI actions on the listener,
  deliberately outside chef so rollback needs no converge. Weights are
  reconciled back to template values on stack updates — during a ramp,
  stack updates must be coordinated or the template weight bumped to match.
