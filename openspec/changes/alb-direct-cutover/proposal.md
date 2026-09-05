# alb-direct-cutover

## Why

Once the weighted canary has held at 100% direct-to-Puma for a full
release cycle, nginx on load-balanced instances is dead weight: an extra
hop, an extra service to monitor, and a second config surface for a
proxy doing nothing. This change makes the direct path permanent and
retires nginx from ALB environments — and only those. Adhoc keeps nginx,
deliberately: it has no ALB or CloudFront, the real TLS certificate is
provisioned into cdo-nginx only when no load balancer exists, and
nginx's `:443` listener is adhoc's internet-facing front door. Removing
it there would kill HTTPS and expose plaintext Puma on a public instance
(adversarial review, blocker 1).

## What Changes

- `cloud_formation_stack.yml.erb`: the weighted forward collapses back to
  a single forward to the direct (9000) target group; the port-80 nginx
  target group is deleted, taking its health check and daemon target with
  it (the direct group has carried its own since `alb-weighted-canary`).
  **BREAKING** for anything targeting instance port 80.
- `bootstrap_frontend.sh.erb` first-boot health-check curl moves to
  `localhost:9000/health_check`.
- `cookbooks/cdo-apps/recipes/default.rb` gates `cdo-nginx` on
  `node['cdo-apps']['load_balancer']` (the first-boot attribute
  established by `puma-alb-readiness`), replacing the always-true
  `nginx_enabled` attribute: LB instances run `cdo-nginx::stop` (extended
  to also remove the nginx package), adhoc keeps the full recipe.
- With cdo-nginx no longer included on LB instances, its
  `node.override` of `dashboard_sock` disappears, so Puma's unix-socket
  bind falls away and the `dashboard_alb_port` TCP listener remains as
  the only one — no `puma.rb` edit needed (the bind table in
  `puma-alb-readiness` was designed for exactly this state). Adhoc keeps
  socket + nginx; development keeps its tcp fallback.
- `cdo-cloudwatch-agent` drops `/var/log/nginx/error.log` on nodes where
  `node['cdo-apps']['load_balancer']` is true.

The adversarial review's "five coordinated port sites" (blocker 2) are
covered across the series: target-group port, health-check port, and the
non-frontends daemon target moved in `alb-weighted-canary`; the port
attribute plumbing landed in `puma-alb-readiness`; this change performs
the remaining two moves (listener collapse, bootstrap curl) plus the
nginx retirement, in one deployable unit.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-http-serving`: the weighted/dual-path requirements from
  `alb-weighted-canary` and the dual-bind requirement from
  `puma-alb-readiness` are replaced by the direct-serving end state;
  adds the adhoc nginx-retention requirement.

## Impact

- CloudFormation stack, `cdo-apps`/`cdo-nginx` cookbooks,
  `bootstrap_frontend.sh.erb`, cloudwatch-agent attributes.
- Error-flavor shift on single-instance staging/test: a full
  `systemctl restart dashboard` now yields ALB 503/connection-refused
  instead of nginx 502 for the same duration. `puma_worker_killer`
  rolling restarts keep the listener bound and are unaffected.
- The nginx `:443` and `:8080` listeners disappear from LB instances;
  the canary phase plus repo search found no consumers (production certs
  there are self-signed; codeprojects reaches the origin via the ALB).
