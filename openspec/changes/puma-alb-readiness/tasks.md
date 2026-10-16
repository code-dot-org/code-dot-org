# puma-alb-readiness — tasks

## 1. Puma config

- [ ] 1.1 Remove `queue_requests false` and its nginx comment from `dashboard/config/puma.rb`
- [ ] 1.2 Add `persistent_timeout 75` to `dashboard/config/puma.rb` in the non-development block, with a comment naming the ALB 60s idle timeout as the reason
- [ ] 1.3 Rewrite the bind block per the design's three-conditional table: unix socket if `CDO.dashboard_sock`, additionally `tcp://0.0.0.0:#{CDO.dashboard_alb_port}` if `CDO.dashboard_alb_port`, and the existing `tcp://host:port` fallback only when neither is set

## 2. Chef plumbing

- [ ] 2.1 Add `"cdo-apps": {"load_balancer": <%= !!load_balancer %>}` to the first-boot JSON in `aws/cloudformation/bootstrap_chef_stack.sh.erb` (next to the existing `unless load_balancer` cert block)
- [ ] 2.2 Add `'load_balancer' => false` and `'dashboard_alb_port' => 9000` under `default['cdo-apps']` in `cookbooks/cdo-apps/attributes/default.rb`
- [ ] 2.3 In `cookbooks/cdo-apps/recipes/default.rb`, mirror the port into config only for LB nodes: `node.override['cdo-secrets']['dashboard_alb_port'] = node['cdo-apps']['dashboard_alb_port'] if node['cdo-apps']['load_balancer']` (same mechanism as the existing `dashboard_port` mirroring at line ~81)
- [ ] 2.4 Extend the `dashboard_listeners` file-resource content string in `cookbooks/cdo-apps/libraries/cdo_apps.rb` (line ~97) to append the ALB port, so listener config changes restart Puma

## 3. Verification

- [ ] 3.1 [ops] Converge staging; `ss -ltn` shows Puma on 9000 and the unix socket present; nginx serving unchanged
- [ ] 3.2 [ops] `curl localhost:9000/health_check` returns `healthy!` on the converged instance
- [ ] 3.3 [ops] Request 9000 from a host in the LB security group succeeds; from elsewhere times out
- [ ] 3.4 [ops] Converge an adhoc; `ss -ltn` shows no 9000 listener
- [ ] 3.5 [ops] Confirm the live ALB idle timeout attribute is 60s (raise 75 if the real value is higher)
- [ ] 3.6 [ops] Soak one staging cycle: no new 5xx in per-route dashboards, no Puma error-log growth

Tasks marked [ops] require converge/AWS access an implementing agent does not have: implement 1.x–2.x, then hand off with the [ops] checklist.
