# rack-request-body-limit — design

## Context

With `queue_requests true` (puma-alb-readiness), Puma's reactor spools
large request bodies to tempfiles before a worker thread sees the request.
Spooling happens below Rack, so middleware cannot prevent the disk write
for a request already in flight — but it can (a) refuse declared-oversize
requests instantly and (b) stop reads on undeclared-length bodies at the
cap, bounding the damage window to one request body's worth of disk at a
time rather than unbounded.

## Goals / Non-Goals

**Goals:**
- No request larger than the configured cap is processed by the app.
- Declared-length violations are rejected without reading the body.
- Same enforcement regardless of which proxy (nginx, ALB-direct) fronted
  the request.

**Non-Goals:**
- Rate limiting or WAF-style rules (the ALB exposure itself is addressed
  by `alb-cloudfront-only-sg`).
- Per-route limits (files API already enforces its own 5 MB/2 GB caps at
  the app layer; this is the outer bound).
- Changing Puma's below-Rack spooling behavior.

## Decisions

- **Hand-rolled ~40-line middleware over a gem.** The logic is small
  (compare `CONTENT_LENGTH`, wrap `rack.input` with a counting reader that
  raises at the cap); existing in-repo precedent is `lib/cdo/rack/*`
  middlewares. A dependency is not warranted.
- **Default cap 4 GiB via `CDO.max_request_body_size`.** Parity with
  nginx today; measuring-then-lowering is an operational follow-up, not
  part of this change. A lower default would risk breaking an unknown
  large-upload flow during the same window as the serving-path migration —
  one variable at a time.
- **Insert at position 0** —
  `config.middleware.insert_before 0, Cdo::Rack::RequestBodyLimit` in
  `dashboard/config/application.rb` (next to the existing
  `insert_before 0, Rack::Cors` at line 53). Position 0 is required, not
  a style choice: the legacy API middlewares (`FilesApi` at line 101,
  `ChannelsApi`, `NetSimApi`, sound/animation libraries) terminate
  requests deep in the stack, so an `insert_before ActionDispatch::Static`
  placement would not cover the exact upload endpoints this change
  exists to protect.
- **Enforcement mechanism**: for declared lengths, compare
  `env['CONTENT_LENGTH'].to_i` against the cap and return 413 without
  calling the app. For undeclared lengths, replace `env['rack.input']`
  with a wrapper that counts bytes across `read`/`gets`/`each` and raises
  a middleware-private exception at the cap; the middleware rescues that
  exception class (only) and returns 413.
- **413 with a plain-text body**, matching what nginx returns today for
  the same condition.

## Risks / Trade-offs

- [A client that lies with a small Content-Length then streams more] →
  Rack input wrapping counts actual bytes read and raises at the cap;
  the request fails mid-read with 413.
- [Puma has already spooled the body to disk before Rack runs] → true and
  accepted; the cap bounds concurrent-request disk use, and
  `alb-cloudfront-only-sg` removes the anonymous ALB-direct path entirely.
- [Some internal client legitimately sends >4 GiB] → nginx already blocks
  that today; parity means no new breakage.

## Migration Plan

Ship middleware dark (limit = nginx parity), soak one release on staging
and production while nginx still fronts everything, watch for unexpected
413s in per-route dashboards. Rollback: remove the middleware insertion.
