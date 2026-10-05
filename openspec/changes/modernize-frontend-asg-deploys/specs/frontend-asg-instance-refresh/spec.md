## ADDED Requirements

### Requirement: Instance replacement is performed by Auto Scaling instance refresh
The `Frontends` group SHALL declare `UpdatePolicy.AutoScalingInstanceRefresh` with
`Strategy: Rolling`, and SHALL NOT declare `AutoScalingRollingUpdate`. The two policies cannot
coexist on one group.

#### Scenario: A new AMI triggers a refresh
- **WHEN** a release produces a new launch template version
- **THEN** Auto Scaling performs an instance refresh to replace the fleet, rather than
  CloudFormation orchestrating the replacement

#### Scenario: Both policies present
- **WHEN** a template declares `AutoScalingInstanceRefresh` and `AutoScalingRollingUpdate` on
  the same group
- **THEN** the stack update fails — this is a configuration error, not a fallback

#### Scenario: Live desired capacity is tracked, not snapshotted
- **WHEN** capacity is added during a deploy, by hand or by a scaling policy
- **THEN** the refresh respects the new desired capacity rather than terminating the added
  instances at the end of the rollout

### Requirement: Instance warmup is set explicitly
`Preferences.InstanceWarmup` SHALL be set explicitly on the instance refresh policy. It SHALL
NOT be left to resolve through the group's unset `DefaultInstanceWarmup` to its
`HealthCheckGracePeriod`.

#### Scenario: Warmup is not inherited from the health check grace period
- **WHEN** the instance refresh policy is rendered
- **THEN** `InstanceWarmup` carries an explicit value. Left unset it would resolve to
  `HealthCheckGracePeriod`, which is 2000 seconds on this group; at the observed peak of 22
  instances a fleet-wide refresh would run for over twelve hours

### Requirement: Replacement launches before terminating and may exceed maximum capacity
`Preferences.MinHealthyPercentage` SHALL be 100 so that new instances launch before old ones
are terminated, and `Preferences.MaxHealthyPercentage` SHALL be above 100 so the group may
temporarily exceed its maximum capacity while replacing instances.

#### Scenario: Deploy at the group's ceiling
- **WHEN** a deploy runs while desired capacity has reached `MaxSize`
- **THEN** the refresh proceeds, because a maximum healthy percentage above 100 permits the
  group to exceed its maximum capacity during replacement

#### Scenario: Capacity does not dip during replacement
- **WHEN** a batch of instances is replaced
- **THEN** the number of healthy instances in service does not fall below the group's desired
  capacity

### Requirement: Instance readiness is gated by the lifecycle hook
Readiness SHALL be signalled by completing the existing `autoscaling:EC2_INSTANCE_LAUNCHING`
lifecycle hook, `WebServerHook`. Instance refresh does not support `cfn-signal`, so the
`cloudformation signal-resource` call in the frontend bootstrap script SHALL NOT be relied on
to gate batch progression.

#### Scenario: Refresh waits for application bootstrap
- **WHEN** a replacement instance has launched but has not finished provisioning
- **THEN** the refresh does not proceed to the next batch until the instance calls
  `CompleteLifecycleAction`

#### Scenario: Failed bootstrap does not reach service
- **WHEN** the bootstrap script fails and completes the lifecycle action with `ABANDON`
- **THEN** the instance does not enter service and the refresh does not count it as a
  successful replacement

### Requirement: A CloudWatch alarm rolls the deploy back
`Preferences.AlarmSpecification.Alarms` SHALL name at least one CloudWatch alarm covering
frontend request health, so that a deploy which degrades the service is reverted without
operator intervention.

#### Scenario: Bad release trips the alarm
- **WHEN** replacement instances enter service and the named alarm goes into `ALARM` during the
  refresh
- **THEN** the refresh is rolled back and the previous configuration is restored

### Requirement: The Auto Scaling group's health check type is unchanged
This change SHALL NOT set `HealthCheckType` to `ELB`. The rollback signal SHALL come from a
CloudWatch alarm over the load balancer's own target health metrics instead.

#### Scenario: Saturation does not cause self-termination
- **WHEN** the fleet is saturated and `/health_check` — a Puma request — exceeds the load
  balancer's 5-second health check timeout
- **THEN** the Auto Scaling group does not terminate those instances. The load balancer stops
  routing to them and the metric is visible to the alarm, but the group's health check type
  remains `EC2`, so saturated-but-working instances are not replaced under load

### Requirement: The loss of partial-success tolerance is resolved before shipping
`AutoScalingRollingUpdate.MinSuccessfulInstancesPercent: 80` tolerates a fifth of a batch
failing to signal. Instance refresh has no equivalent — it retries for one hour and then fails.
The change SHALL record what replaces that tolerance before it is deployed to production.

#### Scenario: Straggler instances
- **WHEN** a replacement instance fails to complete its lifecycle hook
- **THEN** the refresh retries for up to an hour and then fails the stack update, rather than
  proceeding on a percentage of successful signals — and this behaviour is understood and
  accepted in advance, not discovered during a release
