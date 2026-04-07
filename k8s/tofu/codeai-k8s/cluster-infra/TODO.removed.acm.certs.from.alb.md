# TODO: removed ACM certificate ARNs from ALB bootstrap

We removed the explicit ALB certificate publication path from phase 2.

Removed:

- generated `aws-load-balancer-controller.ingressClassParams.spec.certificateArn`
- generated `gateway.loadBalancerConfig.defaultCertificateArn`
- the phase-2 publication path whose only purpose was feeding those values:
  - `codeai-cluster-config.tf` general `cluster_subdomain_wildcard_certificate_arn`
  - `infra/networking/outputs.tf` `cluster_subdomain_wildcard_certificate_arn`
  - root `outputs.tf` `cluster_subdomain_wildcard_certificate_arn`

Why this is a risk:

- bootstrap now depends on AWS Load Balancer Controller certificate discovery
  instead of explicit ARN pinning
- if HTTPS bringup fails, this is a prime suspect

Supporting AWS docs:

- Ingress:
  `TLS certificates for ALB Listeners can be automatically discovered with hostnames from Ingress resources if the spec.certificateArn in IngressClassParams or alb.ingress.kubernetes.io/certificate-arn annotation is not specified.`
  Source: https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/guide/ingress/cert_discovery/

- Gateway:
  `Both L4 and L7 Gateway implementations support static certificate configuration and certificate discovery using Listener hostname.`
  Source: https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.15/guide/gateway/gateway/

Clean order:

1. phase 2 publishes no explicit ALB cert ARN
2. phase 3 brings back Argo
3. Crossplane creates zone, delegation, ACM cert, and validation records
4. networking comes up without explicit cert ARN
5. ingress apps come up with HTTPS listener + hostnames
6. ALB controller discovers the wildcard ACM cert from those hosts

If HTTPS is broken during bringup, read this file first.
