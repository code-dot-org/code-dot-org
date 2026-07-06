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
  a single forward to the 9000 target group; the port-80 nginx target
  group is deleted. **BREAKING** for anything targeting instance port 80.
- The five coordinated port sites move together (adversarial review,
  blocker 2): target group port and `HealthCheckPort`; the explicit
  non-frontends daemon target (`Targets: [{Id: daemon, Port: 80}]`,
  line ~381); `cdo-apps` port plumbing; the
  `bootstrap_frontend.sh.erb` first-boot health-check curl
  (`localhost:9000/health_check`).
- `cookbooks/cdo-apps/recipes/default.rb` gates `cdo-nginx` on the
  environment having no load balancer (adhoc), replacing the always-true
  `nginx_enabled` attribute; LB instances run `cdo-nginx::stop` and the
  nginx package is removed from them.
- LB environments stop setting `dashboard_sock`; Puma's unix-socket bind
  disappears there (the existing conditional in `puma.rb` handles this),
  leaving the single TCP :9000 listener. Adhoc keeps the socket + nginx.
- `cdo-cloudwatch-agent` drops `/var/log/nginx/error.log` for LB
  environments.

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
