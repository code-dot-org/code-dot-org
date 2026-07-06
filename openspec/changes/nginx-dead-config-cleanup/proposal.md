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
  `app_server` attribute has been `puma` since the Unicorn migration;
  the template is unrendered. The `unicorn.sh.erb` under
  `cookbooks/cdo-nginx/test/cookbooks/nginx_test/` goes with it.
- Remove the `unicorn` remnants that exist only to support the dead
  template path where trivially safe (comments referencing it), but keep
  `RuntimeDirectory=unicorn` in `puma.service.erb` — the socket path is
  live production configuration, renamed in a later change.

Explicitly out of scope: the `/var/log/nginx/error.log` entry in
`cdo-cloudwatch-agent` attributes. That log is still written while nginx
runs; it is removed by the `alb-direct-cutover` change.

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
