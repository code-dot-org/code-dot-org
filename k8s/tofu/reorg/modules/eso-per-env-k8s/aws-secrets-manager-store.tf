#==============================================================================
# Per-k8s-namespace SecretStore : aws-secrets-manager-store in kubernetes
#
# This is installed in "one namespace per environment type" situations, namely:
# - staging, levelbuilder, test, and production
# 
# This configures a SecretStore for the External Secrets Operator (ESO) with
# the correct IAM role to be able to sync ONLY the secrets for that env type
# from AWS Secrets Manager.
#==============================================================================

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


#==============================================================================
# ClusterSecretStore : aws-secrets-manager-store-${env_type} in kubernetes
#
# This is installed in "multiple namespace per env type" situations, namely:
# - adhoc, where all adhoc-* namespaces will have access to this ClusterSecretStore
# 
# This configures a ClusterSecretStore for the External Secrets Operator (ESO) with
# the correct IAM role to be able to sync ONLY the secrets for that env type
# from AWS Secrets Manager.
#==============================================================================

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

#============================================================
# Kubernetes namespace in case it doesn't exist
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
      "eks.amazonaws.com/role-arn" = var.iam_role_arn
    }
  }

  depends_on = [kubernetes_namespace_v1.this]
}
