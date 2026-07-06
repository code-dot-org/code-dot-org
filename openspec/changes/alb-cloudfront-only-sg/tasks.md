# alb-cloudfront-only-sg — tasks

## 1. Discovery

- [ ] 1.1 Athena/CLI query over ALB access logs (s3://cdo-logs) for client IPs outside the CloudFront prefix list, two-week window; classify every source
- [ ] 1.2 Migrate or allowlist each legitimate direct-origin consumer; document in the runbook

## 2. Security groups

- [ ] 2.1 Complete `ALBSecurityGroup` in `vpc.yml.erb` (443-only from `CloudFrontManagedPrefixList`; export value)
- [ ] 2.2 Add `ALBSecurityGroup` as an ingress source on `FrontendSecurityGroup` for the serving port, alongside the legacy source
- [ ] 2.3 Deploy the VPC stack; verify no consumer breakage (additive only)

## 3. Origin protocol

- [ ] 3.1 Change dashboard origin `OriginProtocolPolicy` from `match-viewer` to `https-only` in `lib/cdo/aws/cloudfront.rb`
- [ ] 3.2 Decide the ALB HTTP :80 listener's fate (redirect action or removal) and implement

## 4. Cutover

- [ ] 4.1 Swap the studio ALB `SecurityGroups` to `ALBSecurityGroup` in staging/test; verify site works via CloudFront and direct curls to the ALB time out
- [ ] 4.2 Production swap; compare ALB request counts against the discovery baseline
- [ ] 4.3 Record follow-up: retire `ELBSecurityGroup` once the legacy codeprojects LB is gone
