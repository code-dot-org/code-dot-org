#============================================================
# Kargo git credentials via AWS Secrets Manager + ESO
#============================================================
#
# Kargo needs Git credentials so it can push updates to:
# https://github.com/code-dot-org/k8s-gitops.git
#
# This creates:
# 1) AWS Secrets Manager secrets at:
#    k8s/tofu/${cluster_name}/kargo/gitops_repo_{username,password}
# 2) A SecretStore + ExternalSecret in namespace kargo-shared-resources
# 3) A Kubernetes secret named kargo-k8s-gitops labeled for Kargo git auth

resource "kubernetes_namespace_v1" "kargo_shared_resources" {
  metadata {
    name = local.kargo_shared_resources_namespace_name
  }
}

resource "kubernetes_service_account_v1" "kargo_shared_resources_eso" {
  metadata {
    name      = local.kargo_shared_resources_service_account_name
    namespace = local.kargo_shared_resources_namespace_name

    annotations = {
      "eks.amazonaws.com/role-arn" = var.kargo_external_secret_stores_iam_role_arn
    }
  }

  depends_on = [kubernetes_namespace_v1.kargo_shared_resources]
}

resource "kubernetes_manifest" "kargo_shared_resources_secret_store" {
  manifest = {
    apiVersion = "external-secrets.io/v1"
    kind       = "SecretStore"
    metadata = {
      name      = local.kargo_shared_resources_secret_store_name
      namespace = local.kargo_shared_resources_namespace_name
    }
    spec = {
      provider = {
        aws = {
          service = "SecretsManager"
          region  = local.cluster_region
          auth = {
            jwt = {
              serviceAccountRef = {
                name = kubernetes_service_account_v1.kargo_shared_resources_eso.metadata[0].name
              }
            }
          }
        }
      }
    }
  }

  depends_on = [
    helm_release.external_secrets,
    kubernetes_service_account_v1.kargo_shared_resources_eso,
  ]
}

resource "kubernetes_manifest" "kargo_gitops_repo_external_secret" {
  manifest = {
    apiVersion = "external-secrets.io/v1"
    kind       = "ExternalSecret"
    metadata = {
      name      = "kargo-k8s-gitops"
      namespace = local.kargo_shared_resources_namespace_name
    }
    spec = {
      refreshInterval = "5m"
      secretStoreRef = {
        name = local.kargo_shared_resources_secret_store_name
        kind = "SecretStore"
      }
      target = {
        name           = "kargo-k8s-gitops"
        creationPolicy = "Owner"
        template = {
          engineVersion = "v2"
          metadata = {
            labels = {
              "kargo.akuity.io/cred-type" = "git"
            }
          }
          data = {
            repoURL  = "https://github.com/code-dot-org/k8s-gitops.git"
            username = "{{ .username }}"
            password = "{{ .password }}"
          }
        }
      }
      data = [
        {
          secretKey = "username"
          remoteRef = {
            key = module.kargo_k8s_gitops_repo_username.aws_secret_name
          }
        },
        {
          secretKey = "password"
          remoteRef = {
            key = module.kargo_k8s_gitops_repo_password.aws_secret_name
          }
        }
      ]
    }
  }

  depends_on = [
    helm_release.external_secrets,
    kubernetes_manifest.kargo_shared_resources_secret_store,
    module.kargo_k8s_gitops_repo_username,
    module.kargo_k8s_gitops_repo_password,
  ]
}

#==============================================================
# Bootstrap Secrets to AWS Secrets Manager (if variables set)
#==============================================================

module "kargo_k8s_gitops_repo_username" {
  source = "../../../../modules/bootstrapped-aws-secret"

  aws_secret_name           = "${local.kargo_secret_prefix}/gitops_repo_username"
  secret_value_to_bootstrap = var.kargo_k8s_gitops_repo_username
}

module "kargo_k8s_gitops_repo_password" {
  source = "../../../../modules/bootstrapped-aws-secret"

  aws_secret_name           = "${local.kargo_secret_prefix}/gitops_repo_password"
  secret_value_to_bootstrap = var.kargo_k8s_gitops_repo_password
}
