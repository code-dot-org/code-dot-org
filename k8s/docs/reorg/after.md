# OpenTofu

**Phase 0: non-dependent non-AWS / non-cluster bootstrap**
- `codeai-k8s-dex`

**Phase 1: `eks-cluster-*` only**
- `eks-cluster-*`

**Phase 2.1: AWS**

- `cluster-domain-route53.tf`: (HostedZone.route53 k8s.code.org), (RecordSet.route53 k8s.code.org NS)
- `cluster-subdomain-acm.tf`: (Certificate.acm *.k8s.code.org), (RecordSet.route53 _1ca151c5ef18f4c523ea8e0c97de1c6a.adhoc.k8s.code.org), (RecordSet.route53 _de9defbeb7e0a48bbc49f5e7a704b1f6.k8s.code.org), (RecordSet.route53 _98326d39ac6f51e383453a9121585660.levelbuilder.k8s.code.org), (RecordSet.route53 _427c03f0a7f6290bfb754231d5cf89d8.production.k8s.code.org), (RecordSet.route53 _273e85e3c3743269c46d470896cbe79b.staging.k8s.code.org), (RecordSet.route53 _94669ec6512dbc5c29f6c00a7e005876.test.k8s.code.org)
- `external-dns.tf`
  - module `external_dns_addon`: (Role.iam external-dns-20260319022352248300000003), (Policy.iam external-dns-20260319022352248200000002)
- `aws-load-balancer-controller-addon.tf`
  - module `aws_load_balancer_controller_addon`: (Role.iam alb-controller-20260310025500323100000002), (Policy.iam alb-controller-20260310025433483500000001)
- `dex-google-client-secret.tf`
  - module `dex_google_client_secret`: (Secret.secretsmanager k8s/tofu/codeai-k8s/dex_google_client_secret)
- `external-secrets-operator-config.tf`
  - module `eso_per_env[<env>]`: (Role.iam codeai-k8s-eso-<env>), (RolePolicy.iam codeai-k8s-eso-<env>/secrets-manager-access)
  - module `eso_per_adhoc`: (Role.iam codeai-k8s-eso-adhoc), (RolePolicy.iam codeai-k8s-eso-adhoc/secrets-manager-access)
- `kargo-external-secret-stores.tf`: (Role.iam codeai-k8s-eso-kargo-external-secret-stores), (RolePolicy.iam codeai-k8s-eso-kargo-external-secret-stores/secrets-manager-access)
- `kargo-github-webhook-secret.tf`
  - module `kargo_github_org_webhook_secret`: (Secret.secretsmanager k8s/tofu/codeai-k8s/kargo/github_org_webhook_secret)

**Phase 2.2: K8S, either Crossplane or ACK**

- `external-dns.tf`:
  - module `external_dns_addon`: (helm external-dns)
- `external-secrets-operator.tf`: (helm external-secrets)
- `argocd.tf`: (helm argo-cd)
- `aws-load-balancer-controller-addon.tf`:
  - module `aws_load_balancer_controller_addon`: (helm aws-load-balancer-controller)
- `dex.tf`: (helm dex), (Namespace.v1 dex), (Secret.v1 dex-google-service-account)
- `external-secrets-operator-config.tf`:
  - module `eso_per_env[<env>]`: (Namespace.v1 <env>), (ServiceAccount.v1 external-secrets-sa-<env>), (SecretStore.external-secrets.io aws-secrets-manager-store) in `<env>`, (ExternalSecret.external-secrets.io cdo-external-secrets) in `<env>`
  - module `eso_per_adhoc`: (ServiceAccount.v1 external-secrets-sa-adhoc), (ClusterSecretStore.external-secrets.io aws-secrets-manager-store-adhoc), (ClusterExternalSecret.external-secrets.io cdo-external-secrets-adhoc)
- `frontend-pod-security-groups.tf`: (SecurityGroupPolicy.vpcresources.k8s.aws frontend-security-group) in `production`, (SecurityGroupPolicy.vpcresources.k8s.aws frontend-security-group) in `test`, (SecurityGroupPolicy.vpcresources.k8s.aws frontend-security-group) in `levelbuilder`
- `gateway-class-aws-alb.tf`: (LoadBalancerConfiguration.gateway.k8s.aws aws-alb), (GatewayClass.gateway.networking.k8s.io aws-alb)
- `kargo-external-secret-stores.tf`: (Namespace.v1 kargo-shared-resources), (Namespace.v1 kargo-system-resources), (ServiceAccount.v1 external-secrets-sa-kargo-shared-resources), (ServiceAccount.v1 external-secrets-sa-kargo-system-resources), (SecretStore.external-secrets.io aws-secrets-manager-store-kargo-shared-resources), (SecretStore.external-secrets.io aws-secrets-manager-store-kargo-system-resources)
- `kargo-github-webhook-secret.tf`: (ExternalSecret.external-secrets.io github-org-webhook-secret)

**Phase 3: non-AWS object creation that depends on phase-2 inputs**
- `kargo-git-credentials.tf`
- `kargo-github-webhook.tf`

# ArgoCD

**Phase 4: app-of-apps boots**
- `argocd-app-of-apps-bootstrap.tf`
- `apps/argocd/application.yaml`
- `apps/argocd/repos.yaml`

**Phase 5: everything after app-of-apps, except `apps/argocd`**
- `apps/kargo/application.yaml`
- `apps/kargo-project-codeai/*`
- `apps/codeai/applicationset.yaml`
- `k8s/helm`
