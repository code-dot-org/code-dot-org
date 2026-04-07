#============================================================
# Crossplane AWS IRSA role
#============================================================
#
# This creates one shared IAM role for the Crossplane AWS provider runtimes we
# expect to install first. Keep the trust strict by naming exact service
# accounts. Keep the policy bounded to the AWS services Crossplane should own.

locals {
  crossplane_aws = {
    namespace            = "crossplane-system"
    service_account_name = "provider-aws"
    role_name            = "${var.cluster_name}-crossplane-aws"
    oidc_host            = replace(var.oidc_provider_arn, "/^(.*provider/)/", "")
    cluster_subdomain    = var.cluster_subdomain
    parent_zone_arn      = "arn:${data.aws_partition.current.partition}:route53:::hostedzone/${data.aws_route53_zone.parent_domain.zone_id}"
    hosted_zone_arn_wildcard = "arn:${data.aws_partition.current.partition}:route53:::hostedzone/*"
    iam_role_names = concat(
      [
        "${var.cluster_name}-external-dns",
        "${var.cluster_name}-aws-load-balancer-controller",
        "${var.cluster_name}-eso-dex",
        "${var.cluster_name}-eso-kargo-external-secret-stores",
        "${var.cluster_name}-eso-adhoc",
      ],
      [
        for env in sort(tolist(var.single_namespace_environment_types)) :
        "${var.cluster_name}-eso-${env}"
      ]
    )
    iam_policy_names = [
      "${var.cluster_name}-external-dns",
      "${var.cluster_name}-aws-load-balancer-controller",
    ]
  }
}

data "aws_partition" "current" {}
data "aws_caller_identity" "current" {}

data "aws_route53_zone" "parent_domain" {
  name         = var.parent_domain
  private_zone = false
}

data "aws_iam_policy_document" "crossplane_aws_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.crossplane_aws.oidc_host}:sub"
      values = ["system:serviceaccount:${local.crossplane_aws.namespace}:${local.crossplane_aws.service_account_name}"]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.crossplane_aws.oidc_host}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "crossplane_aws" {
  statement {
    effect = "Allow"
    actions = [
      "acm:AddTagsToCertificate",
      "acm:DeleteCertificate",
      "acm:DescribeCertificate",
      "acm:GetCertificate",
      "acm:ListCertificates",
      "acm:ListTagsForCertificate",
      "acm:RemoveTagsFromCertificate",
      "acm:RenewCertificate",
      "acm:RequestCertificate",
      "acm:UpdateCertificateOptions",
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "route53:CreateHostedZone",
      "route53:GetChange",
      "route53:ListHostedZones",
      "route53:ListHostedZonesByName",
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "route53:ChangeTagsForResource",
      "route53:DeleteHostedZone",
      "route53:GetHostedZone",
      "route53:ListResourceRecordSets",
      "route53:ListTagsForResource",
    ]
    resources = [local.crossplane_aws.hosted_zone_arn_wildcard]
  }

  # TODO: if we want to allocate domains outside *.k8s.code.org, lift this
  # restriction. For now, keep Crossplane in a Route53 playpen while we
  # experiment.
  statement {
    effect = "Allow"
    actions = [
      "route53:ChangeResourceRecordSets",
    ]
    resources = [local.crossplane_aws.parent_zone_arn]

    condition {
      test     = "ForAllValues:StringEquals"
      variable = "route53:ChangeResourceRecordSetsRecordTypes"
      values   = ["NS"]
    }

    condition {
      test     = "ForAllValues:StringLike"
      variable = "route53:ChangeResourceRecordSetsNormalizedRecordNames"
      values   = [local.crossplane_aws.cluster_subdomain]
    }
  }

  # TODO: if we want to allocate domains outside *.k8s.code.org, lift this
  # restriction. For now, keep Crossplane in a Route53 playpen while we
  # experiment.
  statement {
    effect = "Allow"
    actions = [
      "route53:ChangeResourceRecordSets",
    ]
    resources = [local.crossplane_aws.hosted_zone_arn_wildcard]

    condition {
      test     = "ForAllValues:StringLike"
      variable = "route53:ChangeResourceRecordSetsNormalizedRecordNames"
      values = [
        local.crossplane_aws.cluster_subdomain,
        "*.${local.crossplane_aws.cluster_subdomain}",
      ]
    }
  }

  # CloudFront is global, and its control-plane APIs do not admit a cleaner
  # resource fence for the first slice.
  statement {
    effect = "Allow"
    actions = [
      "cloudfront:Create*",
      "cloudfront:Delete*",
      "cloudfront:Get*",
      "cloudfront:List*",
      "cloudfront:TagResource",
      "cloudfront:UntagResource",
      "cloudfront:Update*",
    ]
    resources = ["*"]
  }

  # IAM is fenced to the concrete names we expect Crossplane to manage in this
  # cluster. Keep the allow-list explicit so the shared provider role is not a
  # generic IAM admin principal.
  statement {
    effect = "Allow"
    actions = [
      "iam:AttachRolePolicy",
      "iam:CreatePolicy",
      "iam:CreatePolicyVersion",
      "iam:CreateRole",
      "iam:DeletePolicy",
      "iam:DeletePolicyVersion",
      "iam:DeleteRole",
      "iam:DeleteRolePolicy",
      "iam:DetachRolePolicy",
      "iam:PutRolePolicy",
      "iam:SetDefaultPolicyVersion",
      "iam:TagPolicy",
      "iam:TagRole",
      "iam:UntagPolicy",
      "iam:UntagRole",
      "iam:UpdateAssumeRolePolicy",
      "iam:UpdateRole",
    ]
    resources = concat(
      [
        for role_name in local.crossplane_aws.iam_role_names :
        "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:role/${role_name}"
      ],
      [
        for policy_name in local.crossplane_aws.iam_policy_names :
        "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:policy/${policy_name}"
      ]
    )
  }

  statement {
    effect = "Allow"
    actions = [
      "iam:Get*",
      "iam:List*",
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "elasticache:AddTagsToResource",
      "elasticache:Create*",
      "elasticache:Delete*",
      "elasticache:Describe*",
      "elasticache:List*",
      "elasticache:Modify*",
      "elasticache:RebootCacheCluster",
      "elasticache:RemoveTagsFromResource",
      "elasticache:TagResource",
      "elasticache:TestFailover",
      "elasticache:UntagResource",
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "rds:AddTagsToResource",
      "rds:Create*",
      "rds:Delete*",
      "rds:Describe*",
      "rds:ListTagsForResource",
      "rds:Modify*",
      "rds:Promote*",
      "rds:RebootDBInstance",
      "rds:RemoveTagsFromResource",
      "rds:Restore*",
      "rds:Start*",
      "rds:Stop*",
    ]
    resources = ["*"]
  }

  # Secrets Manager is intentionally absolute for now. Tighten this once secret
  # naming is fixed. A reasonable future fence is:
  # arn:${partition}:secretsmanager:${region}:${account}:secret:${cluster_name}/crossplane/*
  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:*",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role" "crossplane_aws" {
  name               = local.crossplane_aws.role_name
  assume_role_policy = data.aws_iam_policy_document.crossplane_aws_trust.json
}

resource "aws_iam_role_policy" "crossplane_aws" {
  name   = "aws-service-access"
  role   = aws_iam_role.crossplane_aws.id
  policy = data.aws_iam_policy_document.crossplane_aws.json
}
