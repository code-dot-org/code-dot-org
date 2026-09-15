# nginx-dead-config-cleanup

## Why

The per-instance nginx layer is being removed from the ALB-fronted serving
path (see the nginx-removal change series). Before any behavior-changing
work lands, delete the parts of the nginx-era configuration that are
already dead: config that no code consumes and templates no recipe
renders. Landing these first shrinks the diff of every later change and
proves out the chef deploy pipeline with zero behavioral risk.

## What Changes

- Remove the `proxy_set_header X-Request-Start "t=${msec}"` directive from
  `cookbooks/cdo-nginx/templates/default/nginx.conf.erb`. Repo-wide search
  finds no consumer; the APM integration that read it is long gone.
- Delete `cookbooks/cdo-apps/templates/default/unicorn.sh.erb`. The
  `app_server` attribute has been `puma` since the Unicorn migration, so
  `cdo_apps.rb` renders `puma.service.erb` and this template is
  unrendered dead code.

Explicitly out of scope:
- `cookbooks/cdo-nginx/test/cookbooks/nginx_test/` in its entirety. Its
  `unicorn.sh.erb` is a separate vendored fixture that the test recipe
  renders for a toy unicorn app to smoke-test nginx proxying; it is
  self-contained and unaffected by the cdo-apps deletion.
- `RuntimeDirectory=unicorn` in `puma.service.erb` and the `/run/unicorn`
  socket path attribute — live production configuration.
- The `/var/log/nginx/error.log` entry in `cdo-cloudwatch-agent`
  attributes. That log is still written while nginx runs; it is removed
  by the `alb-direct-cutover` change.

## Capabilities

### New Capabilities

- `frontend-http-serving`: how HTTP traffic reaches Puma on chef-managed
  instances — the capability the whole change series modifies. This change
  seeds the spec with the requirement that instance-level proxy config
  contains no directives without a consumer.

### Modified Capabilities

None (first change in the series; the capability is created here).

## Impact

- `cookbooks/cdo-nginx/templates/default/nginx.conf.erb`: one line removed.
- `cookbooks/cdo-apps/templates/default/unicorn.sh.erb`: deleted.
- `cookbooks/cdo-nginx/test/cookbooks/nginx_test/templates/default/unicorn.sh.erb`: deleted.
- No runtime behavior change. nginx reloads with an identical effective
  config minus one unread header.
