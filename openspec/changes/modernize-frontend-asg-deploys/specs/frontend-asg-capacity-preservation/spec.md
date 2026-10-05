## ADDED Requirements

### Requirement: A stack update does not change the frontend group's size
A CloudFormation stack update SHALL leave the `Frontends` Auto Scaling group's `MinSize`,
`MaxSize` and `DesiredCapacity` as it found them, unless those values were changed in the
template itself. The group SHALL declare
`UpdatePolicy.AutoScalingScheduledAction.IgnoreUnmodifiedGroupSizeProperties: true` to achieve
this. No Lambda, custom resource, or other runtime lookup SHALL be involved.

#### Scenario: Deploy while the fleet has scaled out
- **WHEN** a release deploys while the CPU target-tracking policy has raised desired capacity
  above the template's literal
- **THEN** the group's desired capacity is unchanged when the update completes

#### Scenario: Consecutive deploys
- **WHEN** a second release deploys immediately after the first, with no template change
- **THEN** the group's size is again unchanged — the guarantee does not depend on anything
  cached, rendered, or invalidated between the two deploys

#### Scenario: Deploy across a scheduled action
- **WHEN** a release deploys while a `ScheduledAction` has moved `MinSize` away from the
  template's literal
- **THEN** the scheduled `MinSize` survives the update

#### Scenario: Template change is still honoured
- **WHEN** `MaxSize` is changed in the template and a release deploys
- **THEN** the new value is applied to the live group — the ignore policy suppresses unchanged
  values, not the template's authority over changed ones

### Requirement: Group size literals are the live values and never below them
The template SHALL carry literal `MinSize`, `MaxSize` and `DesiredCapacity` values rather than
expressions resolved at deploy time. On any deploy that modifies one of these literals —
including the cutover deploy that introduces them — each literal SHALL be greater than or equal
to the corresponding live value at the moment of the deploy.

A deploy that would apply a literal below the live value SHALL be deferred rather than forced.

#### Scenario: Cutover applies the literals exactly once
- **WHEN** the deploy that replaces the `!GetAtt` expressions with literals runs
- **THEN** CloudFormation applies all three literals, because changing them is a template
  modification; and on every subsequent unchanged deploy they are ignored

#### Scenario: A literal below the live value is caught before deploying
- **WHEN** the live group's `MaxSize` is 50 and the template's literal is 20
- **THEN** the deploy is deferred and the literal is corrected, because applying it would cut
  the fleet's ceiling by more than half

#### Scenario: Deferring rather than forcing
- **WHEN** live desired capacity is above the template's `DesiredCapacity` literal at the
  intended cutover time
- **THEN** the cutover is postponed to a window where live desired capacity has fallen to the
  literal, rather than deployed and allowed to scale back in

### Requirement: The rolling update keeps the whole fleet in service without knowing its size
`UpdatePolicy.AutoScalingRollingUpdate` SHALL express its in-service floor as
`MinActiveInstancesPercent: 100` — a percentage of live desired capacity — and SHALL NOT set
`MinInstancesInService`, which is an absolute count and would reintroduce a dependency on
knowing the fleet size.

#### Scenario: Deploy at the group's ceiling
- **WHEN** a release deploys while desired capacity has reached `MaxSize`
- **THEN** the update is not rejected. `MinInstancesInService` must be strictly less than
  `MaxSize`; a percentage carries no such constraint

#### Scenario: Capacity is held during replacement
- **WHEN** instances are replaced during a stack update
- **THEN** the number of instances in service does not fall below the group's desired capacity

### Requirement: The CountASG custom resource and Lambda are removed
The `ASGCount` custom resource SHALL be removed from the frontend template, and the `CountASG`
Lambda function, its IAM role, and `count_asg.js` SHALL be deleted. Removal SHALL be sequenced
so the Lambda is still invocable when the custom resource is removed.

#### Scenario: Custom resource is removed while the Lambda still exists
- **WHEN** the deploy that removes the `ASGCount` resource runs
- **THEN** CloudFormation sends a `Delete` request to `CountASG`, the function responds
  `SUCCESS`, and the resource is removed cleanly

#### Scenario: Lambda deleted only after nothing references it
- **WHEN** the `CountASG` function is removed from the lambda stack
- **THEN** no deployed stack still declares a `Custom::CountASG` resource — verified against
  the deployed template, not only the repository

#### Scenario: No cache-invalidation property remains
- **WHEN** the frontend template is rendered twice with no intervening change
- **THEN** the rendered output is identical. No property exists whose value varies per render
  for the purpose of forcing a resource update

### Requirement: Rollback exposure is bounded and recorded
Because CloudFormation ignores `IgnoreUnmodifiedGroupSizeProperties` during a stack rollback,
a failed update can apply the template's literals. The template's `DesiredCapacity` literal
SHALL therefore be set no lower than the group's weekday scheduled `MinSize` floor, so that a
rollback cannot take the fleet below a floor that is already in force during normal operation.

#### Scenario: Rollback during a traffic spike
- **WHEN** a stack update fails while desired capacity is well above the template's literals
- **THEN** the group lands no lower than the template's `DesiredCapacity`, and the CPU
  target-tracking policy begins scaling out immediately

#### Scenario: The bound is measured, not assumed
- **WHEN** the change is rehearsed on an adhoc full stack
- **THEN** a deliberately failed update is used to record what the rollback actually does to
  all three size properties, and the result is written back into the design
