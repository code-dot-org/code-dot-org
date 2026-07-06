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
- Keep the nginx_test fixture cookbook consistent by deleting its copy of
  `unicorn.sh.erb` in the same commit, so kitchen runs don't reference a
  pattern the main cookbook no longer has.

## Risks / Trade-offs

- [Out-of-repo consumer of X-Request-Start (e.g. a hand-edited dashboard)]
  → the header never left the instance (nginx→Puma hop only), so the only
  possible consumers are in this repo; search found none.

## Migration Plan

Normal chef converge; nginx reloads with the same effective config.
Rollback is `git revert`.
