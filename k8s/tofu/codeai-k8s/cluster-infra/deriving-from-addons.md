# Deriving IAM Files From Addon Modules

This note exists for two files:

- `infra/external-dns/external-dns.tf`
- `infra/networking/aws-load-balancer-controller.tf`

Those files are no longer addon module calls. They are first-class AWS IAM
resources derived from addon module source. If you want to refresh them to
match newer addon versions, start here.

## Rule

Derive from the exact initialized source in `.terraform/modules/`.

Do not derive from:

- version constraints such as `~> 1.13.0`
- registry docs
- memory
- a guessed Git tag

The resolved module source is the only trustworthy input.

## Current Mapping

| Final file | Old module call | Top-level resolved source | Nested resolved source |
| --- | --- | --- | --- |
| `infra/external-dns/external-dns.tf` | `module.external_dns_addon` | `.terraform/modules/external_dns.external_dns_addon/main.tf` | `.terraform/modules/external_dns.external_dns_addon.external_dns/main.tf` |
| `infra/networking/aws-load-balancer-controller.tf` | `module.aws_load_balancer_controller_addon` | `.terraform/modules/networking.aws_load_balancer_controller_addon/main.tf` | `.terraform/modules/networking.aws_load_balancer_controller_addon.aws_load_balancer_controller/main.tf` |

## Versions Used For The Current Derivation

These came from `.terraform/modules/modules.json`.

| Module key | Resolved version |
| --- | --- |
| `external_dns.external_dns_addon` | `1.23.0` |
| `external_dns.external_dns_addon.external_dns` | `1.1.1` |
| `networking.aws_load_balancer_controller_addon` | `1.13.1` |
| `networking.aws_load_balancer_controller_addon.aws_load_balancer_controller` | `1.1.1` |

## Refresh Workflow

1. Work in `k8s/tofu/codeai-k8s/cluster-infra`.
2. Refresh initialized modules:

```sh
tofu init
```

3. Record the exact resolved versions and directories:

```sh
jq -r '.Modules[] | select(
  .Key=="external_dns.external_dns_addon" or
  .Key=="external_dns.external_dns_addon.external_dns" or
  .Key=="networking.aws_load_balancer_controller_addon" or
  .Key=="networking.aws_load_balancer_controller_addon.aws_load_balancer_controller"
) | [.Key,.Version,.Dir] | @tsv' .terraform/modules/modules.json
```

4. Read the exact resolved source files listed in the mapping table above.
5. Create a temporary working file next to the target file you are regenerating.
6. Reproduce the derived resources using final resource names from the start.
7. Compare the regenerated result to both current configuration and current state.
8. Understand every planned delta before changing live infrastructure.

## What Must Be Reproduced

For both files, reproduce the full derived shape:

- `moved` blocks for role, policy, and attachment
- `removed { destroy = false }` for helper-only state entries
- `aws_partition` data source when required
- assume-role policy document
- permissions policy document
- `aws_iam_role`
- `aws_iam_policy`
- `aws_iam_role_policy_attachment`

Preserve the original semantics:

- name-prefix behavior
- role path
- policy path
- trust policy structure
- service account identity

Do not replace prefix behavior with fixed names just because the current object
names are visible in state.

## Trust Policy Details

Preserve these exactly:

- federated principal is `var.oidc_provider_arn`
- `sub` condition uses the service account identity
- `aud` condition is `sts.amazonaws.com`

## Replacement Mapping

### ExternalDNS

`infra/external-dns/external-dns.tf` replaces:

- `module.external_dns_addon.module.external_dns.aws_iam_role.this[0]`
- `module.external_dns_addon.module.external_dns.aws_iam_policy.this[0]`
- `module.external_dns_addon.module.external_dns.aws_iam_role_policy_attachment.this[0]`

It also forgets helper-only state:

- `module.external_dns_addon.random_bytes.this`
- `module.external_dns_addon.time_sleep.this`

### AWS Load Balancer Controller

`infra/networking/aws-load-balancer-controller.tf` replaces:

- `module.aws_load_balancer_controller_addon.module.aws_load_balancer_controller.aws_iam_role.this[0]`
- `module.aws_load_balancer_controller_addon.module.aws_load_balancer_controller.aws_iam_policy.this[0]`
- `module.aws_load_balancer_controller_addon.module.aws_load_balancer_controller.aws_iam_role_policy_attachment.this[0]`

It also forgets helper-only state:

- `module.aws_load_balancer_controller_addon.time_sleep.this`

## ExternalDNS Notes

The current ExternalDNS derivation is simple.

- The top-level module builds the Route53 policy.
- Our config does not add custom `policy_statements` to ExternalDNS.
- The effective policy is:
  - `route53:ChangeResourceRecordSets` on the delegated cluster zone
  - `route53:ListTagsForResource` on that zone
  - `route53:ListHostedZones` and `route53:ListResourceRecordSets` on `*`

## ALB Notes

This was the place where the earlier derivation went wrong.

The top-level module defines the base policy document. The nested module
defines how `policy_statements` are added to it.

The key nested-module semantics are:

```hcl
perms = concat(var.source_policy_documents, var.override_policy_documents, var.policy_statements)
```

and

```hcl
dynamic "statement" {
  for_each = var.policy_statements
  ...
}
```

That means each custom `policy_statements` entry becomes its own appended IAM
statement. It does **not** get merged into an earlier base statement.

This distinction matters.

### The ALB Mistake To Avoid

Do not fold the custom ALB statements into the base policy, even if the final
JSON looks smaller or more convenient. That changes the policy document.

The current derivation preserves three appended custom statements:

1. Extra Describe/Get actions:
   - `ec2:DescribeIpamPools`
   - `ec2:DescribeRouteTables`
   - `ec2:GetSecurityGroupsForVpc`
   - `elasticloadbalancing:DescribeCapacityReservation`
   - `elasticloadbalancing:DescribeListenerAttributes`
   - `elasticloadbalancing:DescribeTrustStores`
2. Extra Modify actions, gated by:
   - `test = Null`
   - `variable = aws:ResourceTag/elbv2.k8s.aws/cluster`
   - `values = ["false"]`
3. A standalone `elasticloadbalancing:SetRulePriorities` statement

## Comparison Workflow

Use both source and state.

Inspect the current managed policy objects:

```sh
tofu state show 'module.external_dns.module.external_dns_addon.module.external_dns.aws_iam_policy.this[0]'
tofu state show 'module.networking.module.aws_load_balancer_controller_addon.module.aws_load_balancer_controller.aws_iam_policy.this[0]'
```

Or extract the exact stored ALB policy JSON:

```sh
tofu state pull | jq -r '.resources[] | select(.module=="module.networking.module.aws_load_balancer_controller_addon.module.aws_load_balancer_controller" and .type=="aws_iam_policy" and .name=="this") | .instances[0].attributes.policy'
```

Then compare the regenerated policy documents to the current managed ones and
to the intended new addon source. The point is not to force a no-op. The point
is to know exactly why any delta exists.

## Common Mistakes

- assuming the source version from a `~>` constraint instead of `modules.json`
- reading only the top-level addon and not the nested addon
- using registry docs instead of the initialized source
- changing prefix semantics into fixed-name semantics
- forgetting helper-state `removed` blocks
- for ALB, merging custom `policy_statements` into base statements

## Minimum Commands

```sh
tofu init
tofu validate
AWS_PROFILE=codeorg-admin tofu plan -lock=false -no-color
```

Use the plan to understand the effect of the regeneration. Do not treat the
absence of changes as a requirement when intentionally updating to newer addon
versions.
