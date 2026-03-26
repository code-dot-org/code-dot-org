# OpenTofu

**Phase 0: non-dependent non-AWS / non-cluster bootstrap**
- `codeai-k8s-dex`

**Phase 1: `eks-cluster-*` only**
- `eks-cluster-*`

**Phase 2: cluster-adjacent AWS substrate and base controllers**
- `cluster-domain-route53.tf`
- `cluster-subdomain-acm.tf`
- `external-dns.tf`
- `external-secrets-operator.tf`
- `argocd.tf`
- `aws-load-balancer-controller-addon.tf`
- `dex-google-client-secret.tf`
- `dex.tf`
- `external-secrets-operator-config.tf`
- `frontend-pod-security-groups.tf`
- `gateway-class-aws-alb.tf`
- `kargo-external-secret-stores.tf`
- `kargo-github-webhook-secret.tf`

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
