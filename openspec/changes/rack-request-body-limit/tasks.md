# rack-request-body-limit — tasks

## 1. Middleware

- [ ] 1.1 Add `lib/cdo/rack/request_body_limit.rb` per the design's enforcement mechanism: 413 on oversize `CONTENT_LENGTH` before calling the app; counting `rack.input` wrapper raising a middleware-private exception at the cap, rescued to 413
- [ ] 1.2 Add `max_request_body_size: 4294967296` (4 GiB, nginx parity) to the repo-root `config.yml.erb` defaults; reference it as `CDO.max_request_body_size`
- [ ] 1.3 Register with `config.middleware.insert_before 0, Cdo::Rack::RequestBodyLimit` in `dashboard/config/application.rb`, adjacent to the `insert_before 0, Rack::Cors` block (line ~53) — position 0 is load-bearing, see design

## 2. Tests

- [ ] 2.1 Unit tests in `lib/test/cdo/rack/test_request_body_limit.rb`: over-cap Content-Length → 413 with input unread, over-cap chunked stream → 413 mid-read, at-cap body passes through byte-identical, GET without body passes through
- [ ] 2.2 Run from `lib/`: `bundle exec ruby -Itest ./test/cdo/rack/test_request_body_limit.rb`

## 3. Rollout verification

- [ ] 3.1 [ops] Soak on staging: zero 413s from the middleware in per-route dashboards over one release cycle
- [ ] 3.2 [ops] Manual check: multi-MB files-api upload succeeds through the middleware
- [ ] 3.3 [ops] Gate recorded: `alb-weighted-canary` ramp must not start until this has soaked in production

Tasks marked [ops] require deployed-environment access: implement and test 1.x–2.x, then hand off.
