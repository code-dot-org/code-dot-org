**Phase 2: cluster-adjacent AWS substrate and base controllers**

- `cluster-domain-route53.tf`
  1. AWS: `(HostedZone.route53 k8s.code.org)`, `(RecordSet.route53 k8s.code.org NS)`

- `cluster-subdomain-acm.tf`
  1. AWS: `(Certificate.acm *.k8s.code.org)`, `(RecordSet.route53 _1ca151c5ef18f4c523ea8e0c97de1c6a.adhoc.k8s.code.org)`, `(RecordSet.route53 _de9defbeb7e0a48bbc49f5e7a704b1f6.k8s.code.org)`, `(RecordSet.route53 _98326d39ac6f51e383453a9121585660.levelbuilder.k8s.code.org)`, `(RecordSet.route53 _427c03f0a7f6290bfb754231d5cf89d8.production.k8s.code.org)`, `(RecordSet.route53 _273e85e3c3743269c46d470896cbe79b.staging.k8s.code.org)`, `(RecordSet.route53 _94669ec6512dbc5c29f6c00a7e005876.test.k8s.code.org)`

- `external-dns.tf`
  1. module `external_dns_addon`
     1. AWS: `(Role.iam external-dns-20260319022352248300000003)`, `(Policy.iam external-dns-20260319022352248200000002)`
     2. K8S: `(helm external-dns)`

- `external-secrets-operator.tf`
  1. K8S: `(helm external-secrets)`

- `argocd.tf`
  1. K8S: `(helm argo-cd)`

- `aws-load-balancer-controller-addon.tf`
  1. module `aws_load_balancer_controller_addon`
     1. AWS: `(Role.iam alb-controller-20260310025500323100000002)`, `(Policy.iam alb-controller-20260310025433483500000001)`
     2. K8S: `(helm aws-load-balancer-controller)`

- `dex-google-client-secret.tf`
  1. module `dex_google_client_secret`
     1. AWS: `(Secret.secretsmanager k8s/tofu/codeai-k8s/dex_google_client_secret)`

- `dex.tf`
  1. K8S: `(helm dex)`, `(Namespace.v1 dex)`, `(Secret.v1 dex-google-service-account)`

- `external-secrets-operator-config.tf`
  1. module `eso_per_env[<env>]`
     1. AWS: `(Role.iam codeai-k8s-eso-<env>)`, `(RolePolicy.iam codeai-k8s-eso-<env>/secrets-manager-access)`
     2. K8S: `(Namespace.v1 <env>)`, `(ServiceAccount.v1 external-secrets-sa-<env>)`, `(SecretStore.external-secrets.io aws-secrets-manager-store)` in `<env>`, `(ExternalSecret.external-secrets.io cdo-external-secrets)` in `<env>`
  2. module `eso_per_adhoc`
     1. AWS: `(Role.iam codeai-k8s-eso-adhoc)`, `(RolePolicy.iam codeai-k8s-eso-adhoc/secrets-manager-access)`
     2. K8S: `(ServiceAccount.v1 external-secrets-sa-adhoc)`, `(ClusterSecretStore.external-secrets.io aws-secrets-manager-store-adhoc)`, `(ClusterExternalSecret.external-secrets.io cdo-external-secrets-adhoc)`

- `frontend-pod-security-groups.tf`
  1. K8S: `(SecurityGroupPolicy.vpcresources.k8s.aws frontend-security-group)` in `production`, `(SecurityGroupPolicy.vpcresources.k8s.aws frontend-security-group)` in `test`, `(SecurityGroupPolicy.vpcresources.k8s.aws frontend-security-group)` in `levelbuilder`

- `gateway-class-aws-alb.tf`
  1. K8S: `(LoadBalancerConfiguration.gateway.k8s.aws aws-alb)`, `(GatewayClass.gateway.networking.k8s.io aws-alb)`

- `kargo-external-secret-stores.tf`
  1. AWS: `(Role.iam codeai-k8s-eso-kargo-external-secret-stores)`, `(RolePolicy.iam codeai-k8s-eso-kargo-external-secret-stores/secrets-manager-access)`
  2. K8S: `(Namespace.v1 kargo-shared-resources)`, `(Namespace.v1 kargo-system-resources)`, `(ServiceAccount.v1 external-secrets-sa-kargo-shared-resources)`, `(ServiceAccount.v1 external-secrets-sa-kargo-system-resources)`, `(SecretStore.external-secrets.io aws-secrets-manager-store-kargo-shared-resources)`, `(SecretStore.external-secrets.io aws-secrets-manager-store-kargo-system-resources)`

- `kargo-github-webhook-secret.tf`
  1. module `kargo_github_org_webhook_secret`
     1. AWS: `(Secret.secretsmanager k8s/tofu/codeai-k8s/kargo/github_org_webhook_secret)`
  2. K8S: `(ExternalSecret.external-secrets.io github-org-webhook-secret)`
