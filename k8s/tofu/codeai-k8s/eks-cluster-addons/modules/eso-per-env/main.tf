locals {
  cfn_stack_name = coalesce(var.cfn_stack_name, var.environment)

  # Strip "https://" from the issuer URL to get the OIDC provider host used in IAM condition keys
  oidc_host = replace(var.cluster_oidc_issuer_url, "https://", "")

  service_account_name = "external-secrets-sa"
}

#============================================================
# Kubernetes namespace
#============================================================

resource "kubernetes_namespace_v1" "this" {
  metadata {
    name = var.environment
  }
}

#============================================================
# Service account with IRSA annotation
#============================================================

resource "kubernetes_service_account_v1" "eso" {
  metadata {
    name      = local.service_account_name
    namespace = kubernetes_namespace_v1.this.metadata[0].name

    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.eso.arn
    }
  }
}

#============================================================
# ESO SecretStore — one per namespace, backed by the IRSA role above
#
# Note: The ESO CRDs must be installed before this resource can be
# planned/applied. Ensure the root module's helm_release.external_secrets
# is applied first (use depends_on at the module call site).
#============================================================

resource "kubernetes_manifest" "secret_store" {
  manifest = {
    apiVersion = "external-secrets.io/v1"
    kind       = "SecretStore"
    metadata = {
      name      = "aws-secrets-manager"
      namespace = kubernetes_namespace_v1.this.metadata[0].name
    }
    spec = {
      provider = {
        aws = {
          service = "SecretsManager"
          region  = var.region
          auth = {
            jwt = {
              serviceAccountRef = {
                name = kubernetes_service_account_v1.eso.metadata[0].name
              }
            }
          }
        }
      }
    }
  }

  depends_on = [kubernetes_service_account_v1.eso]
}
