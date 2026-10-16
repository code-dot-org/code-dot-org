# adhoc-puma-tls

## Why

`alb-direct-cutover` retires nginx from load-balanced environments but
leaves it on adhoc, where it terminates TLS. That was a scoping decision,
not a technical constraint: Puma terminates TLS natively (`ssl_bind`).
Moving adhoc to Puma-terminated TLS removes the last nginx in the fleet,
collapses the serving topology to one shape everywhere ("Puma listens,
period"), and unblocks deleting the cdo-nginx cookbook.

## What Changes

- On non-LB nodes (adhoc), Puma binds `ssl://0.0.0.0:443` with the
  bootstrap-injected certificate/chain/key and `tcp://0.0.0.0:80`,
  replacing nginx's `:443`/`:80` server blocks. No forced HTTPS redirect —
  parity with nginx today, which serves plain HTTP on 80.
- The `ssl_certificate` cookbook resource keeps materializing cert files
  (including the self-signed fallback when no content is injected); it
  moves out of the cdo-nginx recipe and its change notification restarts
  the dashboard service (Puma has no in-place cert reload).
- `puma.service.erb` gains `AmbientCapabilities=CAP_NET_BIND_SERVICE`,
  rendered only for non-LB nodes, so non-root Puma can bind 80/443.
- TLS floor TLSv1.2, matching the `modern` compatibility the
  ssl_certificate resource is configured with today.
- `cdo-nginx::stop` (already package-removing after `alb-direct-cutover`)
  now applies on adhoc as well; nginx is gone from every environment.
- The `puma-alb-readiness` bind table extends with `dashboard_http_port`
  and TLS config keys, set via cdo-secrets on non-LB nodes in place of
  `dashboard_sock`.
- Follow-up (not this change): delete the cdo-nginx cookbook once no
  converged instance still needs the stop recipe.

Accepted trade-offs, stated here deliberately: Puma does not buffer
responses, and its Ruby TLS stack faces the raw internet on adhoc — no
CloudFront/ALB in front. Adhocs are short-lived, low-traffic dev stacks;
request buffering (`queue_requests`), websockets, and the body cap are
already covered by earlier changes in the series.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-http-serving`: replaces the "Adhoc retains nginx as its TLS
  terminator" requirement from `alb-direct-cutover` with Puma-terminated
  TLS on non-LB nodes.

## Impact

- `dashboard/config/puma.rb` (two new conditional binds),
  `cookbooks/cdo-apps` (cert resource, secrets keys, systemd template
  variable), `cookbooks/cdo-nginx` (recipe include drops to stop-only
  everywhere), `puma.service.erb`.
- Adhoc-only behavior change; LB environments and development are
  untouched (their bind-table branches don't change).
- **BREAKING** on adhoc for any consumer of nginx's `:8080`
  `dashboard_proxy` listener, which dies with nginx; a pre-flight task
  greps for localhost:8080 self-calls.
