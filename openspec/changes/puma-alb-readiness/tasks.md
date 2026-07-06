# puma-alb-readiness — tasks

## 1. Puma config

- [ ] 1.1 Remove `queue_requests false` from `dashboard/config/puma.rb` (delete the line and its nginx comment)
- [ ] 1.2 Add `persistent_timeout 75` to `dashboard/config/puma.rb` (non-development block), with a comment naming the ALB 60s idle timeout as the reason
- [ ] 1.3 Add a conditional second bind: `bind "tcp://0.0.0.0:#{CDO.dashboard_alb_port}"` when `CDO.dashboard_alb_port` is set, alongside the unix-socket bind

## 2. Chef plumbing

- [ ] 2.1 Add `dashboard_alb_port: 9000` to cookbook attributes and mirror it into cdo-secrets only when the environment has a load balancer (same pattern as `dashboard_sock` in `cookbooks/cdo-nginx/recipes/default.rb`)
- [ ] 2.2 Extend the `dashboard_listeners` file resource content in `cookbooks/cdo-apps/libraries/cdo_apps.rb` to include the ALB port so listener changes restart Puma

## 3. Verification

- [ ] 3.1 Converge staging; `ss -ltn` shows Puma on 9000 and the unix socket present; nginx serving unchanged
- [ ] 3.2 `curl localhost:9000/health_check` returns `healthy!` on the converged instance
- [ ] 3.3 Confirm ALB-security-group reachability: request 9000 from a host in the LB security group succeeds; from elsewhere times out
- [ ] 3.4 Converge an adhoc; confirm no 9000 listener exists
- [ ] 3.5 Check the live ALB idle timeout attribute is 60s (or adjust 75 upward to exceed the real value)
- [ ] 3.6 Soak one staging cycle: no new 5xx in per-route dashboards, no Puma error-log growth
