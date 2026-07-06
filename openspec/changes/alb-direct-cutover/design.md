# alb-direct-cutover — design

## Context

Entering this change, LB instances serve identical traffic on port 80
(nginx→socket→Puma) and 9000 (Puma direct), with 100% of ALB traffic
weighted to 9000. The remaining work is deleting the idle path — which is
where the environment split matters, because on adhoc the "idle path" is
the only path: `lib/cdo/cloud_formation/cdo_app.rb` gives adhoc no load
balancer and no CDN, and `bootstrap_chef_stack.sh.erb` injects the real
TLS cert into cdo-nginx only `unless load_balancer`.

## Goals / Non-Goals

**Goals:**
- One serving path on LB instances: ALB → Puma :9000.
- nginx absent from LB instances (package, service, logs, config).
- Adhoc topology byte-for-byte unchanged.

**Non-Goals:**
- Re-architecting adhoc TLS (nginx stays; any future adhoc change is its
  own proposal).
- Deleting the cdo-nginx cookbook (still needed by adhoc).
- Renaming the `/run/unicorn` runtime directory (follow-up nicety, LB
  envs no longer use it after this change).

## Decisions

- **Gate cdo-nginx on load-balancer presence, not a standalone
  `nginx_enabled` attribute.** The attribute was `true` everywhere and
  encoded no topology fact. Deriving from the stack's `load_balancer`
  option makes the invariant structural: nginx exists exactly where
  nothing else terminates TLS. The signal reaches chef the same way the
  cert content does today (`bootstrap_chef_stack.sh.erb` node attributes).
- **All five port sites in one commit, deployed as one stack update +
  converge.** The TG port change re-registers the ASG automatically; a
  partial flip leaves health checks probing a dead port and takes the
  fleet unhealthy. This atomicity requirement is why the canary change
  kept both paths alive until here.
- **Delete the port-80 target group rather than repointing it.** The
  canary already created the correctly-configured 9000 group with
  metric history; keeping it avoids a rename-in-place (TG names are
  immutable and the 32-char stack-name budget is tight).
- **`cdo-nginx::stop` + package removal on LB instances** rather than
  merely not-including the recipe, so long-lived converged instances
  (daemon, staging) actually shed the service instead of orphaning it.
- **Keep `queue_requests` enabled everywhere** including adhoc (nginx
  still buffers there too; the reactor is compatible with both paths) —
  the invariant from `puma-alb-readiness` stays unconditional.

## Risks / Trade-offs

- [Unknown consumer of instance :80/:443/:8080 appears after removal] →
  the canary held 100% for a release cycle with nginx receiving ~0
  requests; check nginx access logs are empty (excluding health checks)
  before this change ships. Rollback: revert + converge restores nginx
  within one deploy.
- [Fixed-index `X-Forwarded-For` parsing breaks with one fewer hop] →
  review found none, but re-grep app + JS for positional XFF/
  `remote_addr` assumptions as a pre-ship task (minor finding 7).
- [Single-instance staging/test full restart now surfaces as ALB 503] →
  same outage duration as today's 502; note in runbooks. Verify
  `deregistration_delay` doesn't slow converge-driven restarts.
- [Adhoc drift: someone later "cleans up" nginx there] → the retention
  requirement lives in the spec; the recipe gate names the reason.

## Migration Plan

Staging/test first, then production, each as: stack update (TG/listener)
+ chef converge (nginx stop/remove, socket unbind) in the same deploy
window. Rollback within the window: revert commit, redeploy stack,
converge — nginx path restores because `puma-alb-readiness`'s dual-bind
code is still present. After production has soaked one release cycle, a
follow-up may delete the dual-bind conditional and `dashboard_sock`
remnants for LB envs.

## Open Questions

- Whether any external monitoring (out of repo: pingdom-style checks,
  runbooks) probes instance :80/:443 directly. Ops sign-off item before
  production.
