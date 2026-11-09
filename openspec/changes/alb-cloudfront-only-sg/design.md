# alb-cloudfront-only-sg — design

## Context

`vpc.yml.erb` exports shared security groups consumed by every stack.
`ELBSecurityGroup` (world-open) predates CloudFront-managed prefix lists
and is attached both to the studio ALB and, on adhoc, directly to
instances. `ALBSecurityGroup` was added later with CloudFront-only 443
ingress but was never wired to anything. CloudFront's origin protocol
policy for dashboard is `match-viewer` (`lib/cdo/aws/cloudfront.rb`),
and viewers are already forced to HTTPS (`ViewerProtocolPolicy:
redirect-to-https`), so origin fetches are effectively HTTPS already —
the plaintext-80 origin path is nearly theoretical.

## Goals / Non-Goals

**Goals:**
- Every request reaching the studio ALB has passed CloudFront (and its
  WAF), in all load-balanced environments.
- No legitimate client loses access silently.

**Non-Goals:**
- Adhoc instance exposure (no ALB there; instances keep their existing
  groups until the adhoc topology is revisited).
- Retiring the legacy codeprojects load balancer (tracked separately;
  `ELBSecurityGroup` survives for it).
- IP-allowlisting office/VPN ranges for direct origin debugging — decide
  in review whether to include a narrow ops allowlist.

## Decisions

- **`https-only` origin protocol + 443-only SG** over adding port-80
  ingress. `redirect-to-https` at the viewer means `match-viewer` sends
  HTTPS to origin for all real traffic; making it explicit removes the
  HTTP listener as an attack path rather than allowlisting it. The ALB
  HTTP listener can then be repurposed to a redirect action or removed.
- **Keep `ELBSecurityGroup` exports intact.** Other stacks import it
  (codeprojects legacy LB, adhoc instances). This change only re-points
  the studio ALB and adds the new ingress source on
  `FrontendSecurityGroup`; deleting the legacy group is a separate
  retirement.
- **Additive-first rollout.** Add `ALBSecurityGroup` ingress sources to
  `FrontendSecurityGroup` and deploy; then swap the ALB's group. Both
  steps are independently reversible; at no point is ALB→instance
  traffic blocked.
- **Discovery before enforcement.** ALB access logs (already in
  s3://cdo-logs) are queried for source IPs outside the CloudFront prefix
  list over a two-week window; every hit is classified (developer curl,
  monitor, abuse) before the swap.

## Risks / Trade-offs

- [Developer/ops workflows curl the origin hostname directly] → they
  break at the SG swap; the discovery query finds them first, and the
  runbook offers alternatives (CloudFront path, or a temporary
  allowlisted SG for diagnosis).
- [CloudFront prefix list entry count against SG rule quota] → the
  managed prefix list counts as its weight (~55 rules) toward the SG
  limit; the SG is otherwise tiny, verified fine.
- [Health of blue/green during SG swap] → SG changes are instant and
  connection-preserving; the additive-first ordering means no window
  where the frontend rejects the ALB.

## Migration Plan

1. Deploy `FrontendSecurityGroup` + completed `ALBSecurityGroup` (no
   consumer change).
2. Run the access-log discovery query; migrate stragglers.
3. Swap the studio ALB SG in staging/test; verify CloudFront path works
   and direct curl times out.
4. Production swap; watch ALB request count for a drop matching only the
   direct-hit traffic identified in discovery.
Rollback at any step: re-point the ALB at `ELBSecurityGroup`.

## Open Questions

- Does ops need a standing allowlisted path for direct-origin debugging,
  or is "temporarily attach a debug SG" acceptable? (Owner: infra.)
- `origin.hourofcode.com` and pegasus distributions share the pattern —
  in scope here or replicated later? Default: studio ALB only; replicate
  once proven.
