locals {
  # Strip "https://" from the issuer URL to get the OIDC provider host used in IAM condition keys
  oidc_host = replace(var.cluster_oidc_issuer_url, "https://", "")
}

data "aws_iam_policy_document" "eso_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.oidc_host}:sub"
      values = [
        "system:serviceaccount:${var.single_namespace_environment_type ? var.environment_type : "external-secrets"}:external-secrets-sa-${var.environment_type}"
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.oidc_host}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "eso_secrets" {
  statement {
    effect  = "Allow"
    actions = ["secretsmanager:GetSecretValue"]

    resources = concat(
      [
        "arn:aws:secretsmanager:${var.region}:${var.aws_account_id}:secret:${var.environment_type}/cdo/*",
      ],
      var.single_namespace_environment_type ? [
        "arn:aws:secretsmanager:${var.region}:${var.aws_account_id}:secret:CfnStack/${var.environment_type}/*",
      ] : []
    )

    condition {
      test     = "StringEquals"
      variable = "secretsmanager:VersionStage"
      values   = ["AWSCURRENT"]
    }
  }
}

resource "aws_iam_role" "eso" {
  name               = "codeai-k8s-eso-${var.environment_type}"
  assume_role_policy = data.aws_iam_policy_document.eso_trust.json
}

resource "aws_iam_role_policy" "eso_secrets" {
  name   = "secrets-manager-access"
  role   = aws_iam_role.eso.id
  policy = data.aws_iam_policy_document.eso_secrets.json
}
