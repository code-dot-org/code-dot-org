# Implementation tasks

Delivered as **three stacked PRs**. Task numbers are stable and referenced from `design.md`,
so grouping does not renumber them.

PRs are units of review; deployment phases are units of deployment, defined in the design's
"Deployment phases". They line up one-to-one here, but the gaps between them are the point:
each gap is an observation window, not a handoff delay.

| PR  | Scope                                              | Sections | Deployment phase | Depends on                                    |
| --- | -------------------------------------------------- | -------- | ---------------- | --------------------------------------------- |
| 1   | Retire the `ASGCount` custom resource               | 1–2      | Phase 1          | —                                             |
| 2   | Delete the `CountASG` Lambda and dead references    | 3        | Phase 2          | PR 1 deployed, plus the Phase 1 revert window |
| 3   | Instance-refresh deploys                            | 4–5      | Phase 3          | PR 2, plus several normal releases            |

PR 2 cannot merge before PR 1 has deployed: removing the custom resource sends a `Delete` to
the Lambda, so the function must outlive the template change. PR 2 also closes the fast revert
path for PR 1, which is why the window between them is measured in releases rather than hours.

## PR 1 — Retire the `ASGCount` custom resource

Closes INF-1502. The cutover deploy is the only one on which the template's group size
literals are applied; after it the ignore policy holds them inert.

### 1. Template change

- [ ] 1.1 Delete the `ASGCount` resource from `aws/cloudformation/components/ami.yml.erb`,
      including the `LatestStackUpdateDateTime: Time.now` line
- [ ] 1.2 Add to the `Frontends` group's `UpdatePolicy`:
      `AutoScalingScheduledAction: {IgnoreUnmodifiedGroupSizeProperties: true}`
- [ ] 1.3 Replace `AutoScalingRollingUpdate.MinInstancesInService: !GetAtt
      ASGCount.DesiredCapacity` with `MinActiveInstancesPercent: 100` (design Decision 2).
      Do not set both — `MinInstancesInService` is what reintroduces the `< MaxSize`
      constraint this change exists to remove
- [ ] 1.4 Replace `CreationPolicy.ResourceSignal.Count: !GetAtt ASGCount.DesiredCapacity` with
      the literal `2` (design Decision 3)
- [ ] 1.5 Replace the three `!GetAtt ASGCount.*` group size properties with literals:
      `MinSize: 3`, `MaxSize: 50`, `DesiredCapacity: 3`. Add a comment recording that these
      are now the authoritative values and that raising the live ceiling means raising it here
- [ ] 1.6 Re-read the live group immediately before the cutover deploy and confirm every
      literal is **greater than or equal to** the live value (design Decision 4). `MaxSize` is
      the one that bites: the template said 20 while the live group was 50. If live desired
      capacity exceeds the `DesiredCapacity` literal, defer the deploy rather than forcing it
- [ ] 1.7 `bundle exec rake stack:lint` and `stack:validate`, and diff the rendered template
      against the current one to confirm nothing outside the `Frontends` group moved

### 2. Rehearsal and cutover

- [ ] 2.1 Bring up an adhoc full stack: `rake adhoc:full_stack:start`. Production is the only
      managed environment with a frontend Auto Scaling group, so this is the only rehearsal
      available (INF-1108)
- [ ] 2.2 **T1** — scale the adhoc group above its template `DesiredCapacity` by hand, then
      deploy. Capacity is unchanged when the update completes
- [ ] 2.3 **T2** — deploy again immediately, changing nothing. Capacity still unchanged. This
      is the case the November incident failed; a single clean deploy does not test it
- [ ] 2.4 **T3** — change `MaxSize` in the template and deploy. The new value *is* applied.
      The ignore policy must not make the template inert
- [ ] 2.5 **T4** — force a rolling update to fail with live desired capacity well above the
      template literals, and record what the rollback does to all three size properties.
      This is the one result not already settled by the AWS documentation, and it is what
      confirms or refutes the bound in design Decision 5. Record the outcome in `design.md`
- [ ] 2.6 Tear down the adhoc stack
- [ ] 2.7 Deploy to production in a low-traffic window with live desired capacity at 3 — the
      weekday overnight trough, per the fourteen-day history in `design.md`
- [ ] 2.8 Immediately deploy a second time with no changes, and confirm the group's size is
      untouched. Capture `MinSize`/`MaxSize`/`DesiredCapacity` before and after both deploys
- [ ] 2.9 Observe across several normal releases before starting PR 2, including at least one
      that spans a scheduled action and one during a scale-out

## PR 2 — Delete the `CountASG` Lambda and dead references

No behavioural change. Closes the fast revert path for PR 1 (design "Rollback"), so it waits
on the observation window rather than on review capacity.

### 3. Removal

- [ ] 3.1 Confirm no stack still references `Custom::CountASG` — check the deployed production
      template, not just the repo
- [ ] 3.2 Remove the `CountASG` function and `CountASGRole` from
      `aws/cloudformation/lambda.yml.erb`
- [ ] 3.3 Delete `aws/cloudformation/count_asg.js`
- [ ] 3.4 Drop the `count_asg.js` bullet from `aws/cloudformation/README.md`
- [ ] 3.5 Drop `'ASGCount'` from `log_resource_filter` in
      `lib/cdo/cloud_formation/cdo_app.rb`. `'FrontendLaunchConfig'` on the same line refers to
      a launch configuration replaced by `FrontendLaunchTemplate` and goes with it
- [ ] 3.6 Deploy the lambda stack and confirm the function is gone
- [ ] 3.7 Close INF-1734 / INF-689 for this function, or note it as one fewer `nodejs6.10`
      function. `AMIManager`, `S3Object` and `S3BucketConfiguration` remain on that runtime and
      are out of scope here

## PR 3 — Instance-refresh deploys

Behind an observation window of several normal releases on the Phase 1 configuration. Not
required to close INF-1502.

### 4. Update policy

- [ ] 4.1 Replace `UpdatePolicy.AutoScalingRollingUpdate` with
      `UpdatePolicy.AutoScalingInstanceRefresh: {Strategy: Rolling}`. The two cannot coexist on
      one group — a template carrying both fails the stack update
- [ ] 4.2 Set `Preferences.InstanceWarmup: 300` **explicitly** (design Decision 6). Omitted, it
      resolves through an unset `DefaultInstanceWarmup` to `HealthCheckGracePeriod: 2000`, and
      a fleet-wide refresh at the observed peak of 22 instances would run over twelve hours
- [ ] 4.3 Set `Preferences.MinHealthyPercentage: 100` and `MaxHealthyPercentage: 150` —
      launch-before-terminate, permitted to exceed the group's maximum capacity while replacing
- [ ] 4.4 Set `Preferences.SkipMatching: false`. AWS documents that skip matching does not
      detect code changes shipped by a user data script, which is how `bootstrap_frontend`
      works
- [ ] 4.5 Remove `SuspendProcesses`; instance refresh does not require processes to be
      suspended, and leaving `ScheduledActions` suspended would be a behaviour change
- [ ] 4.6 Keep `AutoScalingScheduledAction.IgnoreUnmodifiedGroupSizeProperties: true` from PR 1

### 5. Rollback signal and verification

- [ ] 5.1 Add a CloudWatch alarm on the frontend target group — `UnHealthyHostCount` or
      `HTTPCode_Target_5XX_Count` — and wire it into `Preferences.AlarmSpecification.Alarms`
      (design Decision 7). Do **not** switch `HealthCheckType` to `ELB` as part of this;
      `/health_check` is a Puma request and would fail under the load it is meant to detect
- [ ] 5.2 Decide and record what replaces `MinSuccessfulInstancesPercent: 80`. Instance
      refresh has no equivalent: it retries for an hour and then fails the stack update
      (design Decision 8). If stragglers are routine on this fleet, that needs an answer before
      this ships, not after
- [ ] 5.3 Note that `cloudformation signal-resource` in `bootstrap_frontend.sh.erb` is now dead
      for the `Frontends` resource. Leave the call in place for this PR — it is harmless, and
      removing it at the same time as changing the update policy confuses the revert
- [ ] 5.4 Consider a CloudFormation service role on the stack. AWS notes that a long-running
      instance refresh can outlive the temporary credentials CloudFormation uses to call Auto
      Scaling
- [ ] 5.5 Rehearse on an adhoc full stack, including an induced failure that trips the alarm
      and confirms the refresh rolls back
- [ ] 5.6 Deploy to production in a low-traffic window and time a full replacement. Compare
      against the rolling-update baseline captured during PR 1
