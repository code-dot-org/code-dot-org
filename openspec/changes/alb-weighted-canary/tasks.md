# alb-weighted-canary — tasks

## 1. CloudFormation

- [ ] 1.1 Add `ALBTargetGroupDirect` to `cloud_formation_stack.yml.erb`: HTTP port 9000, `HealthCheckPath: /health_check`, `HealthCheckPort: 9000`, same `TargetGroupAttributes` as `ALBTargetGroup`, NO `Name` property (see design — CFN autogenerates; stack name can exhaust the 32-char budget)
- [ ] 1.2 Restructure `HTTPListener` and `HTTPSListener` `DefaultActions` (lines ~325, ~339) from single `TargetGroupArn` to `ForwardConfig` with `TargetGroups: [{nginx TG, Weight: 100}, {direct TG, Weight: 0}]` and `TargetGroupStickinessConfig: {Enabled: true, DurationSeconds: 3600}`
- [ ] 1.3 Add `Ref: ALBTargetGroupDirect` to `frontend_properties.TargetGroupARNs` (line ~276) and, in the `unless frontends` branch (line ~379), give the direct TG `Targets: [{Id: !Ref daemon, Port: 9000}]` mirroring the existing port-80 block
- [ ] 1.4 Confirm the only `ALBTargetGroup` references are lines ~276/327/341 (already enumerated); grep the template and `lib/cdo/cloud_formation/` for any other consumer before merging

## 2. Deploy and verify at weight 0

- [ ] 2.1 [ops] Deploy to test/staging; direct target group shows all targets healthy on 9000
- [ ] 2.2 [ops] Confirm zero traffic on the direct group (ALB `RequestCount` per TG) and unchanged error rates

## 3. Ramp playbook (runbook, per environment)

- [ ] 3.1 Write the ramp runbook (aws CLI `modify-listener` weight commands, gates from the design, rollback = direct weight 0) as `aws/cloudformation/docs/alb-direct-ramp.md`
- [ ] 3.2 [ops] Staging at 1%: /cable websocket idle >60s via direct path stays connected
- [ ] 3.3 [ops] Staging at 1%: multi-MB files-api upload via direct path succeeds
- [ ] 3.4 [ops] Staging: puma_worker_killer rolling restart does not flap 9000 health; full `systemctl restart dashboard` recovers as expected
- [ ] 3.5 [ops] Production ramp 1→10→50→100 with the design's gates; hold each step over a school-day peak
- [ ] 3.6 [ops] Hold at 100 for one release cycle; record sign-off as the gate for `alb-direct-cutover`

Tasks marked [ops] are deploy/traffic actions an implementing agent cannot perform: implement 1.x and 3.1, then hand off.
