#============================================================
# Dex secret bootstrap + IAM role + IRSA service account
#============================================================
#
# This creates:
# 1) AWS Secrets Manager secrets for Dex Google OAuth inputs
# 2) An IAM role permitting ESO to read those secrets
# 3) An IRSA-annotated service account consumed by the static phase3 Dex chart

locals {
  dex_secret_prefix                         = "k8s/tofu/${local.cluster_name}"
  dex_eso_oidc_host                         = replace(local.cluster_oidc_issuer_url, "https://", "")
  dex_namespace_name                        = "dex"
  dex_external_secrets_service_account_name = "external-secrets-sa-dex"
  dex_google_client_secret_aws_secret_name  = "${local.dex_secret_prefix}/dex_google_client_secret"
  dex_google_service_account_key_aws_name   = "${local.dex_secret_prefix}/dex_google_service_account_key"
}

data "aws_iam_policy_document" "dex_external_secrets_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.dex_eso_oidc_host}:sub"
      values = [
        "system:serviceaccount:${local.dex_namespace_name}:${local.dex_external_secrets_service_account_name}",
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.dex_eso_oidc_host}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "dex_external_secrets" {
  statement {
    effect  = "Allow"
    actions = ["secretsmanager:GetSecretValue"]
    resources = [
      "arn:aws:secretsmanager:${local.cluster_region}:${data.aws_caller_identity.current.account_id}:secret:${local.dex_google_client_secret_aws_secret_name}*",
      "arn:aws:secretsmanager:${local.cluster_region}:${data.aws_caller_identity.current.account_id}:secret:${local.dex_google_service_account_key_aws_name}*",
    ]
  }
}

resource "aws_iam_role" "dex_external_secrets" {
  name               = "codeai-k8s-eso-dex"
  assume_role_policy = data.aws_iam_policy_document.dex_external_secrets_trust.json
}

resource "aws_iam_role_policy" "dex_external_secrets" {
  name   = "secrets-manager-access"
  role   = aws_iam_role.dex_external_secrets.id
  policy = data.aws_iam_policy_document.dex_external_secrets.json
}
