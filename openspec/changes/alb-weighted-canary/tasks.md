# alb-weighted-canary — tasks

## 1. CloudFormation

- [ ] 1.1 Add `ALBTargetGroupDirect` (HTTP :9000, health check `/health_check`:9000, same attributes incl. 32-char name budget) to `cloud_formation_stack.yml.erb`
- [ ] 1.2 Restructure `HTTPListener`/`HTTPSListener` `DefaultActions` to `ForwardConfig` with weighted target groups (nginx=100, direct=0) and `TargetGroupStickinessConfig`
- [ ] 1.3 Add the direct TG to `frontend_properties.TargetGroupARNs` (frontends) and an explicit `{Id: daemon, Port: 9000}` target for the non-frontends branch (line ~381)
- [ ] 1.4 Confirm no other template consumers assume a single target group (scaling policies, alarms, slack_health_events component)

## 2. Deploy and verify at weight 0

- [ ] 2.1 Deploy to test/staging; direct target group shows all targets healthy on 9000
- [ ] 2.2 Confirm zero traffic on the direct group (ALB RequestCount per TG) and unchanged error rates

## 3. Ramp playbook (runbook, per environment)

- [ ] 3.1 Write the ramp runbook (weight CLI commands, gates, rollback) next to the stack docs
- [ ] 3.2 Staging at 1%: /cable websocket idle >60s via direct path stays connected
- [ ] 3.3 Staging at 1%: multi-MB files-api upload via direct path succeeds
- [ ] 3.4 Staging: puma_worker_killer rolling restart does not flap 9000 health; full `systemctl restart dashboard` recovers as expected
- [ ] 3.5 Production ramp 1→10→50→100 with gates: per-TG `HTTPCode_ELB_502_Count`, `TargetConnectionErrorCount`, per-route 5xx-ratio dashboards; hold each step over a school-day peak
- [ ] 3.6 Hold at 100 for one release cycle; record sign-off as the gate for `alb-direct-cutover`
