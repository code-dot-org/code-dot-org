# alb-cloudfront-only-sg

## Why

The studio ALB is publicly reachable: it sits in public subnets with the
legacy `ELBSecurityGroup` (0.0.0.0/0 on 80/443). The WAF protecting the
site is a CloudFront-scoped global WebACL, which cannot attach to a
regional ALB — so requests sent straight to the ALB bypass the WAF
entirely, and once nginx leaves the instances they also bypass what used
to be the request-size cap. The fix already half-exists:
`aws/cloudformation/vpc.yml.erb` defines an `ALBSecurityGroup` restricted
to the `CloudFrontManagedPrefixList`, but nothing uses it. Finish it and
put the ALB behind it. (Adversarial review, major finding 4.)

## What Changes

- Complete `ALBSecurityGroup` in `vpc.yml.erb`: today it admits only 443
  from the CloudFront prefix list. Decide the port-80 story: either add
  80-from-CloudFront ingress (CloudFront origins use `match-viewer`, so
  HTTP viewers produce HTTP origin fetches), or switch the CloudFront
  origin protocol policy to `https-only` and keep the SG 443-only.
  Preferred: `https-only` + 443-only — fewer plaintext paths.
- Point the studio ALB (`cloud_formation_stack.yml.erb`
  `SecurityGroups: [!ImportValue VPC-ELBSecurityGroup]`) at
  `ALBSecurityGroup` instead.
- Add `ALBSecurityGroup` as an ingress source in `FrontendSecurityGroup`
  (which today only trusts `ELBSecurityGroup`) so ALB→instance traffic
  still flows; keep `ELBSecurityGroup` sourcing until the legacy
  codeprojects load balancer is retired.
- Inventory and migrate legitimate non-CloudFront ALB clients first:
  developer/ops direct-origin access via `{env}-dashboard.code.org` /
  `origin.*` hostnames, uptime checks, and inter-service calls.
  **BREAKING** for any such client not moved behind CloudFront or an
  allowlisted source.

## Capabilities

### New Capabilities

- `origin-access-control`: which network sources may reach the
  load-balanced origin.

### Modified Capabilities

None.

## Impact

- `aws/cloudformation/vpc.yml.erb` (security groups; exported values),
  `aws/cloudformation/cloud_formation_stack.yml.erb` (ALB SG reference,
  possibly CloudFront origin protocol policy in
  `lib/cdo/aws/cloudfront.rb`).
- Independent of the nginx-removal sequence — valuable on its own, and
  it removes the "anonymous client reaches Puma with no WAF" scenario
  that makes `rack-request-body-limit` load-bearing.
- VPC stack updates affect every environment importing these SGs;
  requires infra-team review and a staged rollout.
