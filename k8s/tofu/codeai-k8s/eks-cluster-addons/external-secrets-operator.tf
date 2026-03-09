#============================================================
# External Secrets Operator (ESO)
#
# Installs the ESO operator and configures one namespace-scoped
# SecretStore per fixed environment (production, staging, test,
# levelbuilder), each with an IRSA-backed IAM role scoped to
# {env}/cdo/* secrets.
#
# See external-secrets-operator-adhocs.tf for the ClusterSecretStore
# that serves adhocs (dynamic adhoc-* namespaces).
#============================================================

data "aws_caller_identity" "current" {}

#------------------------------------------------------------
# ESO operator (Helm)
#------------------------------------------------------------

resource "helm_release" "external_secrets" {
  name             = "external-secrets"
  repository       = "https://charts.external-secrets.io"
  chart            = "external-secrets"
  version          = "2.1.0"
  namespace        = "external-secrets"
  create_namespace = true

  set {
    name  = "installCRDs"
    value = "true"
  }

  # EKS Fargate reserves port 10250 for the kubelet. The chart defaults the
  # webhook to 10250, which causes the apiserver to hit the kubelet and fail
  # TLS validation instead of reaching the ESO webhook.
  set {
    name  = "webhook.port"
    value = "9443"
  }
}

#------------------------------------------------------------
# Per-environment SecretStore + IAM role
#
# depends_on ensures the ESO CRDs exist before we try to
# create SecretStore resources in each module.
#------------------------------------------------------------

module "eso_per_env" {
  for_each = toset(["production", "staging", "test", "levelbuilder"])
  source   = "./modules/eso-per-env"

  environment             = each.value
  cluster_oidc_issuer_url = local.cluster_oidc_issuer_url
  oidc_provider_arn       = local.oidc_provider_arn
  aws_account_id          = data.aws_caller_identity.current.account_id
  region                  = var.region

  depends_on = [helm_release.external_secrets]
}
