# alb-direct-cutover — tasks

## 1. Pre-flight gates

- [ ] 1.1 Canary held at 100% direct for one release cycle (sign-off from `alb-weighted-canary` 3.6)
- [ ] 1.2 nginx access logs on LB instances show ~zero non-health-check requests
- [ ] 1.3 Grep app + JS for positional `X-Forwarded-For` parsing; confirm none (review finding 7)
- [ ] 1.4 Ops confirms no external monitoring probes instance :80/:443 directly

## 2. CloudFormation

- [ ] 2.1 Collapse listener `ForwardConfig` to a single forward to the 9000 target group; delete the port-80 target group
- [ ] 2.2 Update the non-frontends branch daemon target to `{Id: daemon, Port: 9000}` (`cloud_formation_stack.yml.erb` ~381)
- [ ] 2.3 Update `bootstrap_frontend.sh.erb` health-check curl to `localhost:9000/health_check`

## 3. Cookbooks

- [ ] 3.1 Gate cdo-nginx inclusion in `cookbooks/cdo-apps/recipes/default.rb` on the no-load-balancer signal (adhoc); LB envs get `cdo-nginx::stop` plus nginx package removal; delete the `nginx_enabled` attribute
- [ ] 3.2 Stop setting `dashboard_sock` for LB environments so Puma binds TCP only; adhoc keeps socket + nginx (verify `puma.rb` conditional handles both)
- [ ] 3.3 Remove `/var/log/nginx/error.log` from `cdo-cloudwatch-agent` attributes for LB environments
- [ ] 3.4 Update `cdo_apps.rb` `dashboard_listeners` content so the sock→port transition restarts Puma exactly once

## 4. Rollout

- [ ] 4.1 Staging/test: stack update + converge in one window; fleet healthy on 9000 throughout; nginx absent (`systemctl status nginx` fails, package removed)
- [ ] 4.2 Staging/test: full `systemctl restart dashboard` behaves per runbook (brief 503, recovery); verify `deregistration_delay`
- [ ] 4.3 Adhoc regression: converge an adhoc; nginx + TLS + socket unchanged, no TCP listener
- [ ] 4.4 Production: same window procedure; watch per-TG metrics and per-route 5xx dashboards through a school-day peak
- [ ] 4.5 Runbook updates: restart error flavor, no more nginx logs on LB instances
