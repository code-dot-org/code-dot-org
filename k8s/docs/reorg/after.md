# OpenTofu

**Prerequisite: non-dependent non-AWS / non-cluster bootstrap**
- `k8s/tofu/codeai-k8s-dex`

**Phase 1: `cluster` only**
- `k8s/tofu/codeai-k8s/cluster`

**Phase 2: `cluster-infra`; split from Phase 2 in `before.md`**

- `k8s/tofu/codeai-k8s/cluster-infra`

- `infra-modules.tf`
  - module `external_dns`: (HostedZone.route53 k8s.code.org), (RecordSet.route53 k8s.code.org NS), module `external_dns_addon`: (Role.iam external-dns-20260319022352248300000003), (Policy.iam external-dns-20260319022352248200000002), (Namespace.v1 external-dns), (ServiceAccount.v1 external-dns-sa)
  - module `networking`: (Certificate.acm *.k8s.code.org), (RecordSet.route53 _1ca151c5ef18f4c523ea8e0c97de1c6a.adhoc.k8s.code.org), (RecordSet.route53 _de9defbeb7e0a48bbc49f5e7a704b1f6.k8s.code.org), (RecordSet.route53 _98326d39ac6f51e383453a9121585660.levelbuilder.k8s.code.org), (RecordSet.route53 _427c03f0a7f6290bfb754231d5cf89d8.production.k8s.code.org), (RecordSet.route53 _273e85e3c3743269c46d470896cbe79b.staging.k8s.code.org), (RecordSet.route53 _94669ec6512dbc5c29f6c00a7e005876.test.k8s.code.org), module `aws_load_balancer_controller_addon`: (Role.iam alb-controller-20260310025500323100000002), (Policy.iam alb-controller-20260310025433483500000001), (ServiceAccount.v1 aws-load-balancer-controller-sa) in `kube-system`
  - module `dex`: (Secret.secretsmanager k8s/tofu/codeai-k8s/dex_google_client_secret), (Secret.secretsmanager k8s/tofu/codeai-k8s/dex_google_service_account_key), (Role.iam codeai-k8s-eso-dex), (RolePolicy.iam codeai-k8s-eso-dex/secrets-manager-access), (Namespace.v1 dex), (ServiceAccount.v1 external-secrets-sa-dex)
  - module `standard_envtypes`: module `eso_per_envtype[<env>]`: (Role.iam codeai-k8s-eso-<env>), (RolePolicy.iam codeai-k8s-eso-<env>/secrets-manager-access), module `eso_per_envtype_adhoc`: (Role.iam codeai-k8s-eso-adhoc), (RolePolicy.iam codeai-k8s-eso-adhoc/secrets-manager-access)
  - module `kargo_secrets`: (Role.iam codeai-k8s-eso-kargo-external-secret-stores), (RolePolicy.iam codeai-k8s-eso-kargo-external-secret-stores/secrets-manager-access), (Namespace.v1 kargo-system-resources), (ServiceAccount.v1 external-secrets-sa-kargo-system-resources), module `kargo_github_org_webhook_secret`: (Secret.secretsmanager k8s/tofu/codeai-k8s/kargo/github_org_webhook_secret), optional bootstrap writes to (Secret.secretsmanager k8s/tofu/codeai-k8s/kargo/gitops_repo_username) and (Secret.secretsmanager k8s/tofu/codeai-k8s/kargo/gitops_repo_password), GitHub organization webhook
- `codeai-cluster-configmap.tf`: (ConfigMap.v1 codeai-cluster-config) in `kube-system`

**Phase 3: `cluster-infra-argocd`; split from Phase 2 in `before.md`; K8S, either Crossplane or ACK**

- `k8s/tofu/codeai-k8s/cluster-infra-argocd`

- `helm.tf`: (helm external-secrets), (helm argo-cd), (helm networking), (helm external-dns), (helm dex), (helm kargo-secrets)
- `argocd-app-of-apps-bootstrap.tf`: app-of-apps `ApplicationSet` bootstrap
- `helm.tf` + `infra/standard-envtypes` + `infra/eso-per-envtype`:
  - (Namespace.v1 <env>), (ServiceAccount.v1 external-secrets-sa-<env>), (SecretStore.external-secrets.io aws-secrets-manager-store) in `<env>`, (ExternalSecret.external-secrets.io cdo-external-secrets) in `<env>`
  - (ServiceAccount.v1 external-secrets-sa-adhoc), (ClusterSecretStore.external-secrets.io aws-secrets-manager-store-adhoc), (ClusterExternalSecret.external-secrets.io cdo-external-secrets-adhoc)
- `helm.tf` + `infra/kargo-secrets`:
  - (Namespace.v1 kargo-shared-resources), (ServiceAccount.v1 external-secrets-sa-kargo-shared-resources), (SecretStore.external-secrets.io aws-secrets-manager-store-kargo-shared-resources), (ExternalSecret.external-secrets.io kargo-k8s-gitops)
  - (SecretStore.external-secrets.io aws-secrets-manager-store-kargo-system-resources) in `kargo-system-resources`, (ExternalSecret.external-secrets.io github-org-webhook-secret) in `kargo-system-resources`
- `helm.tf` + `infra/standard-envtypes`: (SecurityGroupPolicy.vpcresources.k8s.aws frontend-security-group) in `production`, (SecurityGroupPolicy.vpcresources.k8s.aws frontend-security-group) in `test`, (SecurityGroupPolicy.vpcresources.k8s.aws frontend-security-group) in `levelbuilder`
- `helm.tf` + `infra/networking`: (helm aws-load-balancer-controller), Gateway API CRDs, (LoadBalancerConfiguration.gateway.k8s.aws aws-alb), (GatewayClass.gateway.networking.k8s.io aws-alb)

# ArgoCD

**Phase 4: app-of-apps reconciliation begins**
- `apps/argocd/application.yaml`
- `apps/argocd/repos.yaml`

**Phase 5: everything after app-of-apps, except `apps/argocd`**
- `apps/kargo/application.yaml`
- `apps/kargo-project-codeai/*`
- `apps/codeai/applicationset.yaml`
- `k8s/helm`
