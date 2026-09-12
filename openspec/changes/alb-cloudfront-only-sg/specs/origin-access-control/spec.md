# origin-access-control — delta for alb-cloudfront-only-sg

## ADDED Requirements

### Requirement: The studio ALB accepts traffic only from CloudFront
The studio ALB SHALL admit ingress only from the CloudFront managed
prefix list, so every request has traversed CloudFront and its WAF.

#### Scenario: Direct request to the ALB
- **WHEN** a client sends a request to the ALB's address without going through CloudFront
- **THEN** the connection times out at the security-group layer

#### Scenario: Request via CloudFront
- **WHEN** a request arrives at the ALB from a CloudFront edge
- **THEN** it is accepted and forwarded to the target group

### Requirement: Origin fetches use HTTPS only
CloudFront SHALL fetch the dashboard origin over HTTPS only, and the ALB
security group SHALL NOT admit plaintext port 80 from outside.

#### Scenario: Viewer over HTTPS
- **WHEN** CloudFront fetches the origin for any viewer request
- **THEN** the origin connection is TLS on 443

### Requirement: Frontend instances trust both LB security groups during transition
The frontend security group SHALL admit the serving port from both the
new CloudFront-only ALB group and the legacy ELB group until the legacy
load balancer is retired.

#### Scenario: SG swap window
- **WHEN** the ALB moves from the legacy group to the CloudFront-only group
- **THEN** ALB-to-instance traffic is uninterrupted throughout
