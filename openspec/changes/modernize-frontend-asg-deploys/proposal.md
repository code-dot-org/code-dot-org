## Why

The size of the production frontend fleet is not set by the CloudFormation template. It is
read off the live Auto Scaling group at deploy time by a custom resource, `ASGCount`, backed
by a Lambda named `CountASG`. The Lambda returns the group's current `MinSize`, `MaxSize` and
`DesiredCapacity`, and those values are fed straight back into the template so that a stack
update leaves the fleet size alone.

Something has to do this. Production attaches four `AWS::AutoScaling::ScheduledAction`
resources to the group and a CPU target-tracking policy, all of which move the group size
outside CloudFormation. Left to itself, CloudFormation overwrites their work with the
template's literals on every deploy.

`CountASG` is a poor way to do it.

- The function has not been modified since **2017-05-15** and runs on `nodejs6.10`, a runtime
  AWS deprecated on 2019-08-12 and blocked updates to on the same day. It cannot be patched,
  only deleted and recreated. It is still invoked on every production deploy.
- Its cache is invalidated by a `LatestStackUpdateDateTime: Time.now` property whose only job
  is to make the rendered template differ each time. Deleting that line is invisible in
  review. On 2024-10-29 a commit titled *"Pretty sure this isn't being used"* did exactly
  that, and the next release, on 2024-11-04, cut the fleet from 10 instances to 2 during
  class hours — roughly 20% of requests to studio.code.org failed for twelve minutes and
  first-time level attempts dropped 90%. INF-1502 is the action item from that COE.
- Every failure path inside the Lambda returns the hard-coded defaults `2 / 20 / 2` and
  reports `SUCCESS`, so a failed lookup is indistinguishable from a successful one in the
  stack events the deploy log prints.
- `MinInstancesInService` is set to the live desired capacity, which CloudFormation requires
  to be strictly less than `MaxSize`. A deploy attempted while the fleet has scaled to its
  ceiling is rejected outright.

CloudFormation now does this natively. `IgnoreUnmodifiedGroupSizeProperties` was built for
precisely this case — an Auto Scaling group with scheduled actions attached — and
`MinActiveInstancesPercent` expresses the in-service floor as a percentage of live desired
capacity, so nothing needs to look the number up.

## What Changes

**Phase 1 — retire the custom resource.**

- Remove the `ASGCount` custom resource and the `CountASG` Lambda and its IAM role
- Add `UpdatePolicy.AutoScalingScheduledAction.IgnoreUnmodifiedGroupSizeProperties: true` to
  the `Frontends` Auto Scaling group
- Replace `MinInstancesInService: !GetAtt ASGCount.DesiredCapacity` with
  `MinActiveInstancesPercent: 100`
- Replace the three `!GetAtt ASGCount.*` group size properties with literals set to the live
  values: `MinSize: 3`, `MaxSize: 50`, `DesiredCapacity: 3`. The template currently says
  `2 / 20 / 2`; the live group is `3 / 50 / 7`. That gap is drift the custom resource has been
  silently absorbing, and closing it is the riskiest single step in this change — see the
  cutover rule in `design.md`
- Replace `CreationPolicy.ResourceSignal.Count: !GetAtt ASGCount.DesiredCapacity` with the
  literal `2`, the only value it has ever evaluated to

**Phase 2 — replace CloudFormation-orchestrated rolling updates with instance refresh.**

- Replace `UpdatePolicy.AutoScalingRollingUpdate` with
  `UpdatePolicy.AutoScalingInstanceRefresh`, which hands instance replacement to Auto Scaling
  rather than CloudFormation
- Set `Preferences.InstanceWarmup` explicitly. Omitted, it falls back to
  `DefaultInstanceWarmup` — unset on this group — and then to `HealthCheckGracePeriod`, which
  is 2000 seconds. Left at the default a fleet-wide refresh would take most of a day
- Add `Preferences.AlarmSpecification` so a CloudWatch alarm can roll the deploy back
- Drop `SuspendProcesses`; instance refresh does not require Auto Scaling processes to be
  suspended
- `cloudformation signal-resource` in `bootstrap_frontend.sh.erb` becomes dead code for the
  `Frontends` resource. Readiness is already gated by the existing `WebServerHook` lifecycle
  hook, which instance refresh honours

Phase 2 is deliberately sequenced after Phase 1 and after an observation window. It is not
required to close INF-1502.

## Capabilities

### New Capabilities

- `frontend-asg-capacity-preservation`: a CloudFormation stack update never changes the size
  of the frontend Auto Scaling group, and the mechanism that guarantees it is declarative
  rather than a Lambda
- `frontend-asg-instance-refresh`: frontend instance replacement during a deploy is performed
  by Auto Scaling instance refresh, tracking live desired capacity for the duration and
  rolling back on a CloudWatch alarm

### Modified Capabilities

<!-- No existing specs require modification. -->

## Impact

- `aws/cloudformation/components/ami.yml.erb` — remove the `ASGCount` resource; rewrite the
  `Frontends` group's `CreationPolicy`, `UpdatePolicy` and three size properties
- `aws/cloudformation/lambda.yml.erb` — remove the `CountASG` function and `CountASGRole`
- `aws/cloudformation/count_asg.js` — deleted
- `aws/cloudformation/README.md` — drop the `count_asg.js` bullet
- `lib/cdo/cloud_formation/cdo_app.rb` — drop `'ASGCount'` from `log_resource_filter`.
  `'FrontendLaunchConfig'` on the same line is already dead and goes with it
- `aws/cloudformation/bootstrap_frontend.sh.erb` — Phase 2 only: the `signal-resource` call
  stops being load-bearing
- `Frontends-autoscale-prod` (live resource) — its `MaxSize` is currently 50 against a
  template that says 20. The cutover deploy writes template literals to the live group for
  the first time in nine years
- `arn:aws:lambda:us-east-1:*:function:CountASG` (live resource) — deleted, after the app
  stack stops referencing it
