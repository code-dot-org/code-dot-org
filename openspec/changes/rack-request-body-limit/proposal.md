# rack-request-body-limit

## Why

nginx's `client_max_body_size 4G` is today the only request-size limit in
the serving path. The adversarial review found the ALB is publicly
reachable (the WAF is a CloudFront-scoped global ACL, which cannot attach
to a regional ALB), and app-level checks such as
`dashboard/legacy/middleware/files_api.rb` measure `body.length` only
after the whole body has been read. Once traffic can bypass nginx, an
attacker POSTing directly to the ALB could spool unbounded request bodies
into Puma tempfiles on the instance volume before any 413 fires. An
origin-side cap must exist before any traffic is routed around nginx.

## What Changes

- New Rack middleware in dashboard, inserted early in the stack, that:
  - rejects requests whose `Content-Length` exceeds the limit with `413`
    before reading any of the body;
  - enforces the same limit on chunked/unknown-length bodies by capping
    what may be read.
- Limit is configurable via CDO config, default matching today's
  effective ceiling (4 GiB) so behavior is unchanged, with the option to
  ratchet down once real upload sizes are measured.
- Lands and soaks before `alb-weighted-canary` routes any traffic
  directly to Puma. Hard sequencing requirement.

## Capabilities

### New Capabilities

- `request-body-limits`: origin-side enforcement of maximum request body
  size.

### Modified Capabilities

None.

## Impact

- New middleware file under `lib/cdo/rack/` plus registration in
  `dashboard/config/application.rb` (alongside the existing
  `Rack::Optimize` insertion).
- No behavior change for legitimate traffic: 4 GiB matches nginx's
  current cap; requests above it already fail today (at nginx, with a
  nginx-flavored 413).
- Unit tests under `lib/test/cdo/rack/`.
