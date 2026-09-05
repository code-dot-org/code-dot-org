# nginx-dead-config-cleanup — design

## Context

nginx on each chef-managed instance injects `X-Request-Start` toward Puma.
A repo-wide search finds the producer (`nginx.conf.erb:23`) and no consumer;
the header was read by a since-removed APM queue-time integration.
`unicorn.sh.erb` survives from the Unicorn era: `cdo_apps.rb` renders
`"#{app_server}.service.erb"` and `app_server` is `puma` everywhere, so
the template is dead. The `/run/unicorn` socket path, by contrast, is live
config (`cdo-nginx/attributes/default.rb:6`, `puma.service.erb`
`RuntimeDirectory=unicorn`) and stays.

## Goals / Non-Goals

**Goals:**
- Remove config nothing reads and templates nothing renders.
- Zero behavior change; safe to deploy to every environment in any order.

**Non-Goals:**
- Renaming the `/run/unicorn` runtime directory (live; later change).
- Any change to how requests flow (later changes in the series).
- Touching the cloudwatch-agent nginx log entry (nginx still writes it).

## Decisions

- Delete rather than comment out. Git history is the archive.
- Leave the nginx_test fixture cookbook untouched. Its `unicorn.sh.erb`
  is a vendored copy rendered by
  `test/cookbooks/nginx_test/recipes/default.rb` for a toy unicorn app —
  deleting it would require rewriting the fixture for no production
  benefit. It is not the cdo-apps template and does not keep the dead
  path alive.

## Risks / Trade-offs

- [Out-of-repo consumer of X-Request-Start (e.g. a hand-edited dashboard)]
  → the header never left the instance (nginx→Puma hop only), so the only
  possible consumers are in this repo; search found none.

## Migration Plan

Normal chef converge; nginx reloads with the same effective config.
Rollback is `git revert`.
