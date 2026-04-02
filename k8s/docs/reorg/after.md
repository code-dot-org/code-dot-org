# OpenTofu

**Phase 0: non-dependent non-AWS / non-cluster bootstrap**
- `codeai-k8s-dex`

**Phase 1: `eks-cluster-*` only**
- `eks-cluster-*`

**Phase 2: split from Phase 2 in `before.md`**

- `cluster-domain-route53.tf`: (HostedZone.route53 k8s.code.org), (RecordSet.route53 k8s.code.org NS)
- `cluster-subdomain-acm.tf`: (Certificate.acm *.k8s.code.org), (RecordSet.route53 _1ca151c5ef18f4c523ea8e0c97de1c6a.adhoc.k8s.code.org), (RecordSet.route53 _de9defbeb7e0a48bbc49f5e7a704b1f6.k8s.code.org), (RecordSet.route53 _98326d39ac6f51e383453a9121585660.levelbuilder.k8s.code.org), (RecordSet.route53 _427c03f0a7f6290bfb754231d5cf89d8.production.k8s.code.org), (RecordSet.route53 _273e85e3c3743269c46d470896cbe79b.staging.k8s.code.org), (RecordSet.route53 _94669ec6512dbc5c29f6c00a7e005876.test.k8s.code.org)
- `external-dns.tf`
  - module `external_dns_addon`: (Role.iam external-dns-20260319022352248300000003), (Policy.iam external-dns-20260319022352248200000002)
- `aws-load-balancer-controller-addon.tf`
  - module `aws_load_balancer_controller_addon`: (Role.iam alb-controller-20260310025500323100000002), (Policy.iam alb-controller-20260310025433483500000001)
- `controller-service-accounts.tf`: (Namespace.v1 external-dns), (ServiceAccount.v1 external-dns-sa), (ServiceAccount.v1 aws-load-balancer-controller-sa) in `kube-system`, (Namespace.v1 dex), (ServiceAccount.v1 external-secrets-sa-dex), (Namespace.v1 kargo-system-resources), (ServiceAccount.v1 external-secrets-sa-kargo-system-resources)
- `dex-google-client-secret.tf`
  - module `dex_google_client_secret`: (Secret.secretsmanager k8s/tofu/codeai-k8s/dex_google_client_secret)
- `dex-google-service-account-key.tf`
  - module `dex_google_service_account_key`: (Secret.secretsmanager k8s/tofu/codeai-k8s/dex_google_service_account_key)
- `dex-external-secrets.tf`: (Role.iam codeai-k8s-eso-dex), (RolePolicy.iam codeai-k8s-eso-dex/secrets-manager-access)
- `external-secrets-operator-config.tf`
  - module `eso_per_env[<env>]`: (Role.iam codeai-k8s-eso-<env>), (RolePolicy.iam codeai-k8s-eso-<env>/secrets-manager-access)
  - module `eso_per_adhoc`: (Role.iam codeai-k8s-eso-adhoc), (RolePolicy.iam codeai-k8s-eso-adhoc/secrets-manager-access)
- `kargo-external-secret-stores.tf`: (Role.iam codeai-k8s-eso-kargo-external-secret-stores), (RolePolicy.iam codeai-k8s-eso-kargo-external-secret-stores/secrets-manager-access)
- `kargo-github-webhook-secret.tf`
  - module `kargo_github_org_webhook_secret`: (Secret.secretsmanager k8s/tofu/codeai-k8s/kargo/github_org_webhook_secret)
- `non-aws-bootstrap.tf`
  - module `non_aws_bootstrap`: (helm external-secrets), (Namespace.v1 kargo-shared-resources), (ServiceAccount.v1 external-secrets-sa-kargo-shared-resources), (SecretStore.external-secrets.io aws-secrets-manager-store-kargo-shared-resources), (ExternalSecret.external-secrets.io kargo-k8s-gitops), plus optional bootstrap writes to (Secret.secretsmanager k8s/tofu/codeai-k8s/kargo/gitops_repo_username) and (Secret.secretsmanager k8s/tofu/codeai-k8s/kargo/gitops_repo_password), plus the GitHub organization webhook

**Phase 3: split from Phase 2 in `before.md`; K8S, either Crossplane or ACK**

- `gateway-api-crds.tf`: Gateway API CRDs
- `helm.tf`: (helm argo-cd), (helm aws-load-balancer-controller), (helm external-dns), (helm dex), (helm kargo-github-webhook), (helm kargo-github-webhook-secret)
- `argocd-app-of-apps-bootstrap.tf`: app-of-apps `ApplicationSet` bootstrap
- `external-secrets-operator-config.tf`:
  - module `eso_per_env[<env>]`: (Namespace.v1 <env>), (ServiceAccount.v1 external-secrets-sa-<env>), (SecretStore.external-secrets.io aws-secrets-manager-store) in `<env>`, (ExternalSecret.external-secrets.io cdo-external-secrets) in `<env>`
  - module `eso_per_adhoc`: (ServiceAccount.v1 external-secrets-sa-adhoc), (ClusterSecretStore.external-secrets.io aws-secrets-manager-store-adhoc), (ClusterExternalSecret.external-secrets.io cdo-external-secrets-adhoc)
- `frontend-pod-security-groups.tf`: (SecurityGroupPolicy.vpcresources.k8s.aws frontend-security-group) in `production`, (SecurityGroupPolicy.vpcresources.k8s.aws frontend-security-group) in `test`, (SecurityGroupPolicy.vpcresources.k8s.aws frontend-security-group) in `levelbuilder`
- `gateway-class-aws-alb.tf`: (LoadBalancerConfiguration.gateway.k8s.aws aws-alb), (GatewayClass.gateway.networking.k8s.io aws-alb)

# ArgoCD

**Phase 4: app-of-apps reconciliation begins**
- `apps/argocd/application.yaml`
- `apps/argocd/repos.yaml`

**Phase 5: everything after app-of-apps, except `apps/argocd`**
- `apps/kargo/application.yaml`
- `apps/kargo-project-codeai/*`
- `apps/codeai/applicationset.yaml`
- `k8s/helm`
