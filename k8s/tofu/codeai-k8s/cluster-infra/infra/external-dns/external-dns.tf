# IAM resources for ExternalDNS IRSA and hosted-zone access.
#
# Derived from:
# - aws-ia/eks-blueprints-addons/aws v1.23.0
#   https://github.com/aws-ia/terraform-aws-eks-blueprints-addons/tree/v1.23.0
# - aws-ia/eks-blueprints-addon/aws v1.1.1
#   https://github.com/aws-ia/terraform-aws-eks-blueprints-addon/tree/v1.1.1
#
# If you want to refresh this file to match a newer addon version, read:
# - ../../deriving-from-addons.md

locals {
  external_dns = {
    enabled            = true
    namespace          = "external-dns"
    service_account    = "external-dns-sa"
    role_name          = "external-dns"
    role_path          = "/"
    role_description   = "IRSA for external-dns operator"
    policy_description = "IAM Policy for external-dns operator"
    oidc_host          = replace(var.oidc_provider_arn, "/^(.*provider/)/", "")
    route53_zone_arn   = "arn:${data.aws_partition.external_dns.partition}:route53:::hostedzone/${aws_route53_zone.cluster_subdomain.zone_id}"
  }
}

data "aws_partition" "external_dns" {}

data "aws_iam_policy_document" "external_dns_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.external_dns.oidc_host}:sub"
      values = [
        "system:serviceaccount:${local.external_dns.namespace}:${local.external_dns.service_account}",
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.external_dns.oidc_host}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "external_dns" {
  statement {
    actions   = ["route53:ChangeResourceRecordSets"]
    resources = [local.external_dns.route53_zone_arn]
  }

  statement {
    actions   = ["route53:ListTagsForResource"]
    resources = [local.external_dns.route53_zone_arn]
  }

  statement {
    actions = [
      "route53:ListHostedZones",
      "route53:ListResourceRecordSets",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role" "external_dns" {
  count = local.external_dns.enabled ? 1 : 0

  name_prefix = "${local.external_dns.role_name}-"
  path        = local.external_dns.role_path
  description = local.external_dns.role_description

  assume_role_policy    = data.aws_iam_policy_document.external_dns_assume.json
  force_detach_policies = true
}

resource "aws_iam_policy" "external_dns" {
  count = local.external_dns.enabled ? 1 : 0

  name_prefix = "${local.external_dns.role_name}-"
  path        = local.external_dns.role_path
  description = local.external_dns.policy_description
  policy      = data.aws_iam_policy_document.external_dns.json
}

resource "aws_iam_role_policy_attachment" "external_dns" {
  count = local.external_dns.enabled ? 1 : 0

  role       = aws_iam_role.external_dns[0].name
  policy_arn = aws_iam_policy.external_dns[0].arn
}
