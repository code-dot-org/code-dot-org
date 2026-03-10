locals {
  # Strip "https://" from the issuer URL to get the OIDC provider host used in IAM condition keys
  oidc_host = replace(var.cluster_oidc_issuer_url, "https://", "")
}

#============================================================
# Kubernetes namespace
#============================================================

resource "kubernetes_namespace_v1" "this" {
  count = var.single_namespace_environment_type ? 1 : 0

  metadata {
    name = var.environment_type
  }
}

#============================================================
# Service account with IRSA annotation
#============================================================

resource "kubernetes_service_account_v1" "eso" {
  metadata {
    name      = "external-secrets-sa-${var.environment_type}"
    namespace = var.single_namespace_environment_type ? var.environment_type : "external-secrets"

    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.eso.arn
    }
  }

  depends_on = [kubernetes_namespace_v1.this]
}

#============================================================
# ESO SecretStore — backed by the IRSA role above
#
# Note: The ESO CRDs must be installed before this resource can be
# planned/applied. Ensure the root module's helm_release.external_secrets
# is applied first (use depends_on at the module call site).
#============================================================

resource "kubernetes_manifest" "secret_store" {
  count = var.single_namespace_environment_type ? 1 : 0

  manifest = {
    apiVersion = "external-secrets.io/v1"
    kind       = "SecretStore"
    metadata = {
      name      = "aws-secrets-manager-store"
      namespace = var.environment_type
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

resource "kubernetes_manifest" "cluster_secret_store" {
  count = var.single_namespace_environment_type ? 0 : 1

  manifest = {
    apiVersion = "external-secrets.io/v1"
    kind       = "ClusterSecretStore"
    metadata = {
      name = "aws-secrets-manager-store-${var.environment_type}"
    }
    spec = {
      conditions = [
        {
          namespaceRegexes = var.multi_namespace_regexes
        }
      ]
      provider = {
        aws = {
          service = "SecretsManager"
          region  = var.region
          auth = {
            jwt = {
              serviceAccountRef = {
                name      = kubernetes_service_account_v1.eso.metadata[0].name
                namespace = "external-secrets"
              }
            }
          }
        }
      }
    }
  }

  depends_on = [kubernetes_service_account_v1.eso]
}
