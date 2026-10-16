# alb-cloudfront-only-sg — tasks

## 1. Discovery

- [ ] 1.1 [ops] Athena/CLI query over ALB access logs (s3://cdo-logs) for client IPs outside the CloudFront prefix list, two-week window; classify every source
- [ ] 1.2 [human decision] Disposition for each legitimate direct-origin consumer found (migrate behind CloudFront, allowlist, or retire), and whether ops gets a standing debug allowlist or a temporarily-attached debug SG (design open question — owner: infra)

## 2. Security groups

- [ ] 2.1 Complete `ALBSecurityGroup` in `vpc.yml.erb`: keep 443-only ingress from `CloudFrontManagedPrefixList`; add an export (`VPC-ALBSecurityGroup`) mirroring the existing `VPC-ELBSecurityGroup` export pattern
- [ ] 2.2 Add `ALBSecurityGroup` as a second ingress source on `FrontendSecurityGroup` for port 9000 (and 80 while nginx remains), alongside the legacy `ELBSecurityGroup` source
- [ ] 2.3 [ops] Deploy the VPC stack; verify no consumer breakage (additive only)

## 3. Origin protocol

- [ ] 3.1 Change the dashboard origin `OriginProtocolPolicy` from `match-viewer` to `https-only` in `lib/cdo/aws/cloudfront.rb` (line ~181)
- [ ] 3.2 [human decision] The ALB HTTP :80 listener's fate once the SG blocks public 80: recommended default is converting its `DefaultActions` to a redirect-to-HTTPS action (harmless, self-documenting); deleting it entirely is also safe — infra to pick

## 4. Cutover

- [ ] 4.1 [ops] Swap the studio ALB `SecurityGroups` to the `ALBSecurityGroup` import in staging/test; verify site works via CloudFront and direct curls to the ALB time out
- [ ] 4.2 [ops] Production swap; compare ALB request counts against the discovery baseline
- [ ] 4.3 Record follow-up: retire `ELBSecurityGroup` once the legacy codeprojects LB is gone; replicate the pattern for hourofcode/pegasus distributions once proven (design open question)

Tasks marked [ops] need AWS access; [human decision] items block on infra sign-off and must not be improvised by an implementing agent.
