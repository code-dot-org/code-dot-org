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
# 2) An IRSA role + service account so ESO can read those AWS secrets
# 3) A SecretStore + ExternalSecret in namespace kargo-shared-resources
# 4) A Kubernetes secret named kargo-k8s-gitops labeled for Kargo git auth

locals {
  kargo_secret_prefix = "k8s/tofu/${local.cluster_name}/kargo"
  kargo_eso_oidc_host = replace(local.cluster_oidc_issuer_url, "https://", "")
}

#==============================================================
# External Secrets sync into K8S cluster
#==============================================================

resource "kubernetes_manifest" "kargo_secret_store" {
  manifest = {
    apiVersion = "external-secrets.io/v1"
    kind       = "SecretStore"
    metadata = {
      name      = "aws-secrets-manager-store"
      namespace = kubernetes_namespace_v1.kargo_shared_resources.metadata[0].name
    }
    spec = {
      provider = {
        aws = {
          service = "SecretsManager"
          region  = local.cluster_region
          auth = {
            jwt = {
              serviceAccountRef = {
                name = kubernetes_service_account_v1.kargo_eso.metadata[0].name
              }
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_manifest" "kargo_gitops_repo_external_secret" {
  manifest = {
    apiVersion = "external-secrets.io/v1"
    kind       = "ExternalSecret"
    metadata = {
      name      = "kargo-k8s-gitops"
      namespace = kubernetes_namespace_v1.kargo_shared_resources.metadata[0].name
    }
    spec = {
      refreshInterval = "5m"
      secretStoreRef = {
        name = "aws-secrets-manager-store"
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
    kubernetes_manifest.kargo_secret_store,
    module.kargo_k8s_gitops_repo_username,
    module.kargo_k8s_gitops_repo_password,
  ]
}

#==============================================================
# IAM Permitting External Secrets Operator to Access Secrets
#==============================================================

data "aws_iam_policy_document" "kargo_eso_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.kargo_eso_oidc_host}:sub"
      values   = ["system:serviceaccount:kargo-shared-resources:external-secrets-sa-kargo"]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.kargo_eso_oidc_host}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "kargo_eso_secrets" {
  statement {
    effect  = "Allow"
    actions = ["secretsmanager:GetSecretValue"]
    resources = [
      "arn:aws:secretsmanager:${local.cluster_region}:${data.aws_caller_identity.current.account_id}:secret:${local.kargo_secret_prefix}/*",
    ]

    condition {
      test     = "StringEquals"
      variable = "secretsmanager:VersionStage"
      values   = ["AWSCURRENT"]
    }
  }
}

resource "aws_iam_role" "kargo_eso" {
  name               = "codeai-k8s-eso-kargo-shared-resources"
  assume_role_policy = data.aws_iam_policy_document.kargo_eso_trust.json
}

resource "aws_iam_role_policy" "kargo_eso_secrets" {
  name   = "secrets-manager-access"
  role   = aws_iam_role.kargo_eso.id
  policy = data.aws_iam_policy_document.kargo_eso_secrets.json
}

resource "kubernetes_namespace_v1" "kargo_shared_resources" {
  metadata {
    name = "kargo-shared-resources"
  }
}

resource "kubernetes_service_account_v1" "kargo_eso" {
  metadata {
    name      = "external-secrets-sa-kargo"
    namespace = kubernetes_namespace_v1.kargo_shared_resources.metadata[0].name

    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.kargo_eso.arn
    }
  }
}

#==============================================================
# Bootstrap Secrets to AWS Secrets Manager (if variables set)
#==============================================================

module "kargo_k8s_gitops_repo_username" {
  source = "../../modules/bootstrapped-aws-secret"

  aws_secret_name           = "${local.kargo_secret_prefix}/gitops_repo_username"
  secret_value_to_bootstrap = var.kargo_k8s_gitops_repo_username
}

module "kargo_k8s_gitops_repo_password" {
  source = "../../modules/bootstrapped-aws-secret"

  aws_secret_name           = "${local.kargo_secret_prefix}/gitops_repo_password"
  secret_value_to_bootstrap = var.kargo_k8s_gitops_repo_password
}
