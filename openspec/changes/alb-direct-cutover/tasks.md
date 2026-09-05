# alb-direct-cutover — tasks

## 1. Pre-flight gates

- [ ] 1.1 [ops] Canary held at 100% direct for one release cycle (sign-off from `alb-weighted-canary` 3.6)
- [ ] 1.2 [ops] nginx access logs on LB instances show ~zero non-health-check requests
- [ ] 1.3 Grep dashboard/, lib/, apps/src/ for positional `X-Forwarded-For` parsing (split/index on the header); confirm none (review finding 7)
- [ ] 1.4 [ops] Ops confirms no external monitoring probes instance :80/:443 directly

## 2. CloudFormation

- [ ] 2.1 Collapse `HTTPListener`/`HTTPSListener` `DefaultActions` from `ForwardConfig` back to a single forward to `ALBTargetGroupDirect`; delete the `ALBTargetGroup` resource and its `frontend_properties.TargetGroupARNs` / `unless frontends` Targets references
- [ ] 2.2 Update `bootstrap_frontend.sh.erb` health-check curl (line ~25) to `localhost:9000/health_check`

## 3. Cookbooks

- [ ] 3.1 Replace the `nginx_enabled` ternary in `cookbooks/cdo-apps/recipes/default.rb` (line ~117) with `node['cdo-apps']['load_balancer'] ? 'cdo-nginx::stop' : 'cdo-nginx'`; delete `nginx_enabled` from attributes
- [ ] 3.2 Extend `cookbooks/cdo-nginx/recipes/stop.rb` with `apt_package('nginx') { action :remove }` after the service stop
- [ ] 3.3 Verify (no edit expected) that with cdo-nginx not included, `dashboard_sock` is never set on LB nodes and `puma.rb` binds only `dashboard_alb_port` — per the `puma-alb-readiness` bind table
- [ ] 3.4 Make the `/var/log/nginx/error.log` entry in `cookbooks/cdo-cloudwatch-agent/attributes/default.rb` conditional on `!node['cdo-apps']['load_balancer']`
- [ ] 3.5 Confirm the `dashboard_listeners` file resource registers the sock→no-sock transition and restarts Puma exactly once on the cutover converge

## 4. Rollout

- [ ] 4.1 [ops] Staging/test: stack update + converge in one window; fleet healthy on 9000 throughout; nginx absent (`systemctl status nginx` fails, `dpkg -l nginx` shows removed)
- [ ] 4.2 [ops] Staging/test: full `systemctl restart dashboard` behaves per runbook (brief 503, recovery); verify `deregistration_delay`
- [ ] 4.3 [ops] Adhoc regression: converge an adhoc; nginx + TLS + socket unchanged, no TCP listener
- [ ] 4.4 [ops] Production: same window procedure; watch per-TG metrics and per-route 5xx dashboards through a school-day peak
- [ ] 4.5 Runbook updates: restart error flavor (ALB 503/conn-refused instead of nginx 502), no more nginx logs on LB instances

Tasks marked [ops] are deploy/environment actions an implementing agent cannot perform.
