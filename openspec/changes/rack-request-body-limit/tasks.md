# rack-request-body-limit — tasks

## 1. Middleware

- [ ] 1.1 Add `lib/cdo/rack/request_body_limit.rb`: 413 on oversize `Content-Length` before body read; counting `rack.input` wrapper that 413s at the cap for chunked/absent length
- [ ] 1.2 Add `max_request_body_size` to CDO config with a 4 GiB default (nginx parity)
- [ ] 1.3 Insert the middleware in `dashboard/config/application.rb` ahead of `ActionDispatch::Static` and the legacy files-api middleware

## 2. Tests

- [ ] 2.1 Unit tests in `lib/test/cdo/rack/`: over-cap Content-Length, over-cap chunked stream, at-cap pass-through, no-body GET pass-through
- [ ] 2.2 Run with `bundle exec ruby -Itest` from `lib/` per TESTING.md

## 3. Rollout verification

- [ ] 3.1 Soak on staging: zero 413s from the middleware in per-route dashboards over one release cycle
- [ ] 3.2 Manual check: multi-MB files-api upload succeeds through the middleware
- [ ] 3.3 Gate recorded: `alb-weighted-canary` must not start until this has soaked in production
