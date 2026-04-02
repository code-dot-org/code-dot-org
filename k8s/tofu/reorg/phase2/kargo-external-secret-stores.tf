#============================================================
# Kargo External Secrets Operator Stores + IAM role + IRSA
#============================================================
#
# This creates:
# 1) A shared IAM role permitting ESO to read Kargo AWS secrets
# 2) One IRSA-annotated service account per namespace
# 3) One namespaced SecretStore per namespace

locals {
  kargo_secret_prefix = "k8s/tofu/${local.cluster_name}/kargo"
  kargo_eso_oidc_host = replace(local.cluster_oidc_issuer_url, "https://", "")

  kargo_shared_resources_namespace_name       = "kargo-shared-resources"
  kargo_shared_resources_service_account_name = "external-secrets-sa-kargo-shared-resources"
  kargo_shared_resources_secret_store_name    = "aws-secrets-manager-store-kargo-shared-resources"

  kargo_system_resources_namespace_name       = "kargo-system-resources"
  kargo_system_resources_service_account_name = "external-secrets-sa-kargo-system-resources"
  kargo_system_resources_secret_store_name    = "aws-secrets-manager-store-kargo-system-resources"
}

#==============================================================
# IAM Permitting External Secrets Operator to Access Secrets
#==============================================================

data "aws_iam_policy_document" "kargo_external_secret_stores_trust" {
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
      values = [
        "system:serviceaccount:${local.kargo_shared_resources_namespace_name}:${local.kargo_shared_resources_service_account_name}",
        "system:serviceaccount:${local.kargo_system_resources_namespace_name}:${local.kargo_system_resources_service_account_name}",
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.kargo_eso_oidc_host}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "kargo_external_secret_stores_secrets" {
  statement {
    effect  = "Allow"
    actions = ["secretsmanager:GetSecretValue"]
    resources = [
      "arn:aws:secretsmanager:${local.cluster_region}:${data.aws_caller_identity.current.account_id}:secret:${local.kargo_secret_prefix}/*",
    ]
  }
}

resource "aws_iam_role" "kargo_external_secret_stores" {
  name               = "codeai-k8s-eso-kargo-external-secret-stores"
  assume_role_policy = data.aws_iam_policy_document.kargo_external_secret_stores_trust.json
}

resource "aws_iam_role_policy" "kargo_external_secret_stores_secrets" {
  name   = "secrets-manager-access"
  role   = aws_iam_role.kargo_external_secret_stores.id
  policy = data.aws_iam_policy_document.kargo_external_secret_stores_secrets.json
}
