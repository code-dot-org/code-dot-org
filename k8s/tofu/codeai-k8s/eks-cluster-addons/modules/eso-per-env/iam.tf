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
      values   = ["system:serviceaccount:${var.environment}:${local.service_account_name}"]
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

    resources = [
      "arn:aws:secretsmanager:${var.region}:${var.aws_account_id}:secret:${var.environment}/cdo/*",
      "arn:aws:secretsmanager:${var.region}:${var.aws_account_id}:secret:CfnStack/${local.cfn_stack_name}/*",
    ]

    condition {
      test     = "StringEquals"
      variable = "secretsmanager:VersionStage"
      values   = ["AWSCURRENT"]
    }
  }
}

resource "aws_iam_role" "eso" {
  name               = "codeai-k8s-eso-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.eso_trust.json
}

resource "aws_iam_role_policy" "eso_secrets" {
  name   = "secrets-manager-access"
  role   = aws_iam_role.eso.id
  policy = data.aws_iam_policy_document.eso_secrets.json
}
