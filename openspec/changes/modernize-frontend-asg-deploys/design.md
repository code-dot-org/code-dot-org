## Context

### How it works today

`aws/cloudformation/components/ami.yml.erb` declares a custom resource:

```yaml
ASGCount: <%= lambda_fn 'CountASG',
  Default: {MinSize: 2, MaxSize: 20, DesiredCapacity: 2},
  AutoScalingGroupTags: [
    {Key: 'aws:cloudformation:stack-id', Value: {Ref: 'AWS::StackId'}},
    {Key: 'aws:cloudformation:logical-id', Value: 'Frontends'}
  ],
  LatestStackUpdateDateTime: Time.now
%>
```

`lambda_fn` renders an `AWS::CloudFormation::CustomResource` pointing at a Lambda named
`CountASG` (`aws/cloudformation/lambda.yml.erb`, source in `aws/cloudformation/count_asg.js`).
On Create and Update the function calls `DescribeAutoScalingGroups`, looks for a group whose
CloudFormation-injected tags match this stack and the logical id `Frontends`, and returns that
group's `MinSize`, `MaxSize` and `DesiredCapacity` as resource attributes.

Those attributes are consumed in five places on the `Frontends` group:

| Consumer | Today |
|---|---|
| `Properties.MinSize` | `!GetAtt ASGCount.MinSize` |
| `Properties.MaxSize` | `!GetAtt ASGCount.MaxSize` |
| `Properties.DesiredCapacity` | `!GetAtt ASGCount.DesiredCapacity` |
| `CreationPolicy.ResourceSignal.Count` | `!GetAtt ASGCount.DesiredCapacity` |
| `UpdatePolicy.AutoScalingRollingUpdate.MinInstancesInService` | `!GetAtt ASGCount.DesiredCapacity` |

`rake stack:start` runs on every release from `lib/rake/infra.rake`. `Time.now` makes the
custom resource's properties differ on each render, which is the only thing that causes
CloudFormation to re-invoke the Lambda rather than reuse the attributes it cached from the
previous update.

### Why the fleet size moves outside CloudFormation

Two mechanisms, both live in production only (`cdo_app.rb` sets
`options.frontends ||= rack_env?(:production)`):

- `components/scaling_schedule.yml.erb` — four `AWS::AutoScaling::ScheduledAction` resources
  moving `MinSize` between 2 and 4 on a weekday and weekend cadence
- `CPUScalingPolicy` — target tracking at 50% average CPU, moving `DesiredCapacity`
  continuously

`PredictiveScalingPolicy` is `Mode: ForecastOnly` and does not scale.

### Observed state, 2026-09-16

Read from `Frontends-autoscale-prod` in us-east-1:

| Property | Live | Template literal |
|---|---|---|
| `MinSize` | 3 | 2 |
| `MaxSize` | **50** | **20** |
| `DesiredCapacity` | 7 | 2 |
| `HealthCheckType` | `EC2` | `EC2` |
| `HealthCheckGracePeriod` | 2000 | 2000 |
| `DefaultInstanceWarmup` | unset | unset |
| `InstanceMaintenancePolicy` | unset | unset |
| Suspended processes | none | — |

Fourteen days of `GroupDesiredCapacity`: daily maximum 2–22, daily minimum 2 on weekends and
3 on weekdays. Peak observed 22 against a ceiling of 50.

`CountASG`: `Runtime: nodejs6.10`, `LastModified: 2017-05-15`, `State: Active`, invoked as
recently as today.

The `MaxSize` row is the important one. Someone raised the ceiling from 20 to 50 in the
console and the template was never updated, because the custom resource made that
unnecessary. Nine years of that kind of drift is invisible until the day the template's
literals are applied again.

## Decisions

### Decision 1: Use `IgnoreUnmodifiedGroupSizeProperties` rather than omitting the properties

A tempting alternative is to leave `DesiredCapacity` out of the template and let
CloudFormation not manage it. Rejected. `MinSize` and `MaxSize` are required properties and
must appear regardless, so omission solves at most a third of the problem; and AWS documents
the behaviour of an absent `DesiredCapacity` only for stack *creation* ("the default is the
minimum size of the group"), not for updates. That would be an undocumented behaviour holding
up production capacity.

`IgnoreUnmodifiedGroupSizeProperties` is documented for exactly this situation:

> With scheduled actions, the group size properties of an Auto Scaling group can change at any
> time. When you update a stack with an Auto Scaling group and scheduled action,
> CloudFormation always sets the group size property values of your Auto Scaling group to the
> values that are defined in the `AWS::AutoScaling::AutoScalingGroup` resource of your
> template, even if a scheduled action is in effect.

Setting it to `true` prevents that unless the template values themselves changed. AWS's own
reference example pairs it with `AutoScalingRollingUpdate` on a single group, which is the
shape we need.

### Decision 2: `MinActiveInstancesPercent: 100` replaces `MinInstancesInService`

`MinInstancesInService` is an absolute count, which is the only reason the template needs to
know the live desired capacity at all. `MinActiveInstancesPercent` is a percentage of the
group's desired capacity, so CloudFormation resolves it at update time without help.

`100` is the intent behind today's `MinInstancesInService: !GetAtt ASGCount.DesiredCapacity`:
keep the whole fleet serving while old instances are replaced. It is also the property's
documented default, so stating it explicitly changes nothing but makes the intent legible.

This also removes the `MinInstancesInService < MaxSize` constraint, under which a deploy
attempted at the ceiling is rejected.

### Decision 3: `CreationPolicy.ResourceSignal.Count` becomes the literal `2`

`CreationPolicy` applies when the resource is created. At that moment no group carrying this
stack's tags exists, so `CountASG` falls through to its `Default` and returns `2`. The
expression has never evaluated to anything else. A literal `2` is the same value, written
down.

### Decision 4: every literal must be greater than or equal to the live value at cutover

This is the governing rule for the cutover deploy and the reason it needs a chosen window.

`IgnoreUnmodifiedGroupSizeProperties` compares the template's values across updates, not
against the live group. The cutover replaces `!GetAtt ASGCount.MaxSize` with a literal, which
*is* a modification, so CloudFormation applies all three literals on that one deploy. They
take effect exactly once, and after that the ignore policy holds them inert.

If a literal is below the live value, the cutover deploy shrinks the fleet or lowers its
ceiling. With the template's current `MaxSize: 20` against a live 50, shipping the existing
numbers unchanged would cut the ceiling by more than half. If a literal is at or above the
live value the cutover can only add capacity, which is never an incident.

Hence: `MinSize: 3`, `MaxSize: 50`, `DesiredCapacity: 3`, and the cutover deploy runs in a
window where live desired capacity has fallen to 3. The fourteen-day history puts that in the
weekday overnight trough. A deploy at a moment when live desired is above the literal must be
deferred rather than forced.

`MaxSize: 50` is a straight copy of the live ceiling. It is recorded here so the next person
to raise it knows to raise it in the template.

### Decision 5: the rollback path is the residual exposure, and it is bounded, not eliminated

AWS documents that `IgnoreUnmodifiedGroupSizeProperties` "is ignored during a stack rollback".
The custom resource does not have this gap: on rollback CloudFormation sends it an Update with
the previous properties, it calls `DescribeAutoScalingGroups` again, and it returns live
values. Phase 1 gives that up.

This is a real regression and worth stating plainly rather than burying. The scenario is a
deploy that fails *during* a traffic spike — the same conditions as the incident this change
exists to prevent.

It is bounded rather than eliminated:

- The worst case is the fleet landing at the template's `DesiredCapacity`, 3, which equals the
  weekday scheduled `MinSize` floor. The November incident landed at 2 from a fleet of 10.
- `CPUScalingPolicy` is target tracking and begins scaling out immediately; scheduled actions
  continue to run.
- Raising the `DesiredCapacity` literal raises the floor, at the cost of a wider cutover
  window constraint under Decision 4. 3 is chosen because it is the weekday floor already in
  force; a later change can raise it.

Phase 2 removes the exposure by a different route: instance refresh tracks live desired
capacity throughout, and its rollback is an instance refresh in the other direction rather
than a property write.

### Decision 6: Phase 2 must set `InstanceWarmup` explicitly

`Preferences.InstanceWarmup` is the pause after each new instance reaches `InService` before
the refresh proceeds. If omitted it falls back to the group's `DefaultInstanceWarmup`, which is
unset; that falls back to `HealthCheckGracePeriod`, which is 2000 seconds. At the observed
peak of 22 instances a fleet-wide refresh would spend over twelve hours waiting.

This is the one hard prerequisite inside Phase 2. `300` matches the `EstimatedInstanceWarmup`
already set on `CPUScalingPolicy`.

### Decision 7: ELB health checks are not a prerequisite for either phase

The group is `HealthCheckType: EC2`, carrying a `TODO` about moving to ELB health checks.
Neither phase depends on it.

- Phase 1 gates batch progression on `cfn signal-resource`, via `WaitOnResourceSignals`.
- Phase 2 gates on the `WebServerHook` lifecycle hook. AWS documents that when an
  `autoscaling:EC2_INSTANCE_LAUNCHING` hook is present, instance refresh waits for
  `CompleteLifecycleAction` before proceeding. `bootstrap_frontend.sh.erb` already calls it.

What ELB health checks would add is a safety net — noticing that replacement instances boot
but do not serve. There is a safer way to get that signal. The load balancer already polls
`/health_check` on every target every 10 seconds; `HealthCheckType` only decides whether the
*Auto Scaling group* acts on the result. So `AlarmSpecification` can watch
`UnHealthyHostCount` or `HTTPCode_Target_5XX_Count` and roll the refresh back, without giving
the group licence to terminate instances on a failed check.

That distinction is the substance of the `TODO`. `home#health_check` renders a static string
but is still a Puma request; during the 2024-11-04 incident queue depth reached roughly 1000.
Under that load a 5-second check times out, and with `HealthCheckType: ELB` the group would
begin terminating saturated-but-working instances. Alarm-based rollback gets the signal
without the spiral.

### Decision 8: Phase 2 gives up `MinSuccessfulInstancesPercent`

`AutoScalingRollingUpdate.MinSuccessfulInstancesPercent: 80` tolerates a fifth of a batch
failing to signal. Instance refresh has no equivalent: it retries for an hour, then fails and
rolls back. On a fleet where stragglers are routine this is a behavioural change, and it is
the main reason Phase 2 is a separate PR behind an observation window rather than part of the
Phase 1 cutover.

## Deployment phases

Deployment phases are not the same as PRs. `tasks.md` maps them.

**Phase 1 — cutover.** Template change deployed to production in a low-traffic window with
live desired capacity at 3. Both the ignore policy and the literals take effect on this one
deploy. Verified by a second, no-op deploy immediately afterwards: the November incident only
surfaced on the *second* release, so one clean deploy proves nothing.

**Phase 2 — Lambda removal.** Only after the app stack no longer references the custom
resource. Removing the `ASGCount` resource sends a `Delete` request to `CountASG`, so the
function has to be alive and invocable at that moment. Deleting the function first wedges the
app stack update. `count_asg.js` handles `Delete` by responding `SUCCESS` immediately.

**Phase 3 — instance refresh.** Behind an observation window of several normal releases.

## Testing

Production is the only managed environment with a frontend Auto Scaling group
(`cdo_app.rb:64`). `rake adhoc:full_stack:start` brings up an adhoc stack with
`FRONTENDS=1`, which renders the same `ami` component, and is the only rehearsal available
until INF-1108 gives the test server the same architecture.

The adhoc stack differs from production in ways that matter: no scheduled actions
(`scaling_schedule` is gated on `environment == :production`), smaller instance types, and a
fleet of 2. It can demonstrate that the ignore policy and `MinActiveInstancesPercent` behave
as documented. It cannot reproduce scheduled-action interference, and it cannot tell us much
about timing at 22 instances.

Test T4 — the rollback behaviour — is the one whose result is not already settled by the AWS
documentation, and the one that decides whether Decision 5's bound is the real bound.

## Rollback

**Phase 1** reverts by restoring the previous revision of `ami.yml.erb`, which reinstates the
custom resource. The `CountASG` Lambda must still exist, which is why its removal is a
separate later phase. Reverting after the Lambda is gone means re-creating it first, on a
supported runtime, which is not a fast operation — so the observation window before Phase 2
is also the revert window for Phase 1.

**Phase 3** reverts by restoring `AutoScalingRollingUpdate`. Note that CloudFormation rolls
back using the `UpdatePolicy` from the template *before* the current update, so a revert of
the update policy itself should ship as its own deploy rather than combined with other
changes to the group.
