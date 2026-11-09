# adhoc-puma-tls — design

## Context

On adhoc, `lib/cdo/cloud_formation/cdo_app.rb` provisions no load
balancer or CDN; the studio A-record points at the instance, and
`bootstrap_chef_stack.sh.erb` injects `$CERT`/`$CHAIN`/`$KEY` into
cdo-nginx attributes (`unless load_balancer`). nginx terminates TLS on
:443 via the `ssl_certificate` cookbook resource (self-signed fallback
when no content is provided) and serves plain HTTP on :80. Everything
else nginx did for adhoc is already replaced by earlier changes in this
series: request buffering (`queue_requests`, `puma-alb-readiness`),
body cap (`rack-request-body-limit`), websockets (Puma native).

Puma supports TLS termination natively: `ssl_bind host, port,
{cert:, key:, verify_mode: 'none', no_tlsv1: true, no_tlsv1_1: true}`,
where `cert` may be a full-chain PEM.

## Goals / Non-Goals

**Goals:**
- Adhoc serves HTTPS :443 and HTTP :80 from Puma directly; nginx absent.
- Same certificate provisioning pipeline (injected content or
  self-signed fallback) — only the consumer changes.
- One serving shape fleet-wide after this change: Puma listens, no
  instance-local proxy anywhere.

**Non-Goals:**
- Forced HTTP→HTTPS redirect on adhoc (nginx doesn't do it today;
  parity first — a follow-up can add `force_ssl` or a Rack redirect).
- Deleting the cdo-nginx cookbook in this change (the stop recipe must
  keep converging on existing instances until fleets have shed nginx;
  deletion is a recorded follow-up).
- LB environments and development: their bind-table branches are
  untouched.
- In-place TLS cert reload (restart on change is acceptable for adhoc).

## Decisions

- **`AmbientCapabilities=CAP_NET_BIND_SERVICE` over socket activation or
  high ports.** One line in `puma.service.erb`, rendered only when the
  node is non-LB (template variable from `node['cdo-apps']['load_balancer']`).
  systemd socket activation with TLS binds is fiddlier in Puma and buys
  nothing here; keeping 80/443 preserves the instance's public URLs
  unchanged.
- **Config keys, extending the `puma-alb-readiness` bind table** (all via
  cdo-secrets, set by chef on non-LB nodes only; `dashboard_sock` is no
  longer set anywhere):

  ```
  bind unix://CDO.dashboard_sock                 if CDO.dashboard_sock   (now: never)
  bind tcp://0.0.0.0:CDO.dashboard_alb_port      if CDO.dashboard_alb_port    (LB)
  bind tcp://0.0.0.0:CDO.dashboard_http_port     if CDO.dashboard_http_port   (adhoc: 80)
  ssl_bind '0.0.0.0', CDO.dashboard_ssl_port,
    cert/key from CDO.dashboard_ssl_cert/_key    if CDO.dashboard_ssl_port    (adhoc: 443)
  bind tcp://host:CDO.dashboard_port             if none of the above    (development)
  ```

  The sock branch stays in code one release for converged-instance
  rollback, then dies with the cookbook deletion follow-up.
- **Cert files via the same `ssl_certificate` resource, relocated.** A
  new small recipe (`cdo-apps::tls`) owns the resource on non-LB nodes,
  with the same attribute namespace the bootstrap already writes to, so
  `bootstrap_chef_stack.sh.erb` needs no change beyond the namespace
  staying stable. The resource's change notification switches from
  `reload nginx` to `restart dashboard service` (the existing
  `execute[restart dashboard service]` resource in `cdo_apps.rb`).
- **`verify_mode: 'none'`** (server TLS, no client certs) and
  **TLSv1.2 floor** via `no_tlsv1`/`no_tlsv1_1`, matching the `modern`
  compatibility profile configured on the ssl_certificate resource today.
- **Keep :80 plain HTTP serving** rather than redirect: nginx parity.
  Adhoc URLs are shared in both schemes; changing redirect behavior in
  the same change as the terminator swap would confound debugging.

## Risks / Trade-offs

- [Ruby/OpenSSL TLS on the raw internet — larger attack surface and
  slower handshakes than nginx] → adhocs are short-lived, low-traffic,
  per-branch dev stacks behind their own security group; accepted and
  documented. Not a pattern for production (which terminates at
  CloudFront/ALB).
- [No response buffering: slow client draining a big response holds a
  Puma worker] → same acceptance rationale; adhoc concurrency is tiny.
- [Cert rotation restarts Puma instead of hot-reloading] → adhoc-only,
  restart is the existing chef notify pattern; brief blip acceptable.
- [Unknown consumer of nginx's :8080 dashboard_proxy on adhoc] → the SG
  never exposed 8080 externally; pre-flight task greps for
  localhost:8080 self-calls before removal.
- [Converge ordering: Puma must not race nginx for 80/443] →
  `cdo-nginx::stop` already runs its stop compile-phase, before the app
  service restart — the ordering that `alb-direct-cutover` relies on.

## Migration Plan

Ship after `alb-direct-cutover` has soaked. Fresh adhocs get the new
shape from first converge. Existing adhocs converge to it in place
(compile-phase nginx stop → cert recipe → Puma restart with new binds).
Rollback: revert + converge restores the cdo-nginx include for non-LB
nodes; the socket branch is still in `puma.rb` for exactly this.

## Open Questions

- None blocking. Follow-ups recorded in tasks: cookbook deletion, and
  optionally forcing HTTPS on adhoc once parity is proven.
