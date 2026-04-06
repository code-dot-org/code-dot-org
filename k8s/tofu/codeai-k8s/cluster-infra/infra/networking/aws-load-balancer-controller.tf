# IAM resources for the AWS Load Balancer Controller IRSA role and policy.
#
# Derived from:
# - aws-ia/eks-blueprints-addons/aws v1.13.1
#   https://github.com/aws-ia/terraform-aws-eks-blueprints-addons/tree/v1.13.1
# - aws-ia/eks-blueprints-addon/aws v1.1.1
#   https://github.com/aws-ia/terraform-aws-eks-blueprints-addon/tree/v1.1.1
#
# If you want to refresh this file to match a newer addon version, read:
# - ../../deriving-from-addons.md

locals {
  aws_load_balancer_controller = {
    enabled            = true
    namespace          = "kube-system"
    service_account    = "aws-load-balancer-controller-sa"
    role_name          = "alb-controller"
    role_path          = "/"
    role_description   = "IRSA for aws-load-balancer-controller project"
    policy_description = "IAM Policy for AWS Load Balancer Controller"
    oidc_host          = replace(var.oidc_provider_arn, "/^(.*provider/)/", "")
  }

  aws_load_balancer_controller_policy_statements = [
    {
      actions = [
        "ec2:DescribeIpamPools",
        "ec2:DescribeRouteTables",
        "ec2:GetSecurityGroupsForVpc",
        "elasticloadbalancing:DescribeCapacityReservation",
        "elasticloadbalancing:DescribeListenerAttributes",
        "elasticloadbalancing:DescribeTrustStores",
      ]
      resources = ["*"]
    },
    {
      actions = [
        "elasticloadbalancing:ModifyCapacityReservation",
        "elasticloadbalancing:ModifyIpPools",
        "elasticloadbalancing:ModifyListenerAttributes",
      ]
      resources = ["*"]
      conditions = [
        {
          test     = "Null"
          variable = "aws:ResourceTag/elbv2.k8s.aws/cluster"
          values   = ["false"]
        }
      ]
    },
    {
      actions   = ["elasticloadbalancing:SetRulePriorities"]
      resources = ["*"]
    },
  ]
}

data "aws_partition" "aws_load_balancer_controller" {}

data "aws_iam_policy_document" "aws_load_balancer_controller_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.aws_load_balancer_controller.oidc_host}:sub"
      values = [
        "system:serviceaccount:${local.aws_load_balancer_controller.namespace}:${local.aws_load_balancer_controller.service_account}",
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.aws_load_balancer_controller.oidc_host}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "aws_load_balancer_controller_base" {
  statement {
    actions   = ["iam:CreateServiceLinkedRole"]
    resources = ["*"]

    condition {
      test     = "StringEquals"
      variable = "iam:AWSServiceName"
      values   = ["elasticloadbalancing.amazonaws.com"]
    }
  }

  statement {
    actions = [
      "ec2:DescribeAccountAttributes",
      "ec2:DescribeAddresses",
      "ec2:DescribeAvailabilityZones",
      "ec2:DescribeInternetGateways",
      "ec2:DescribeVpcs",
      "ec2:DescribeVpcPeeringConnections",
      "ec2:DescribeSubnets",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeInstances",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DescribeTags",
      "ec2:GetCoipPoolUsage",
      "ec2:DescribeCoipPools",
      "elasticloadbalancing:DescribeLoadBalancers",
      "elasticloadbalancing:DescribeLoadBalancerAttributes",
      "elasticloadbalancing:DescribeListeners",
      "elasticloadbalancing:DescribeListenerCertificates",
      "elasticloadbalancing:DescribeSSLPolicies",
      "elasticloadbalancing:DescribeRules",
      "elasticloadbalancing:DescribeTargetGroups",
      "elasticloadbalancing:DescribeTargetGroupAttributes",
      "elasticloadbalancing:DescribeTargetHealth",
      "elasticloadbalancing:DescribeTags",
    ]
    resources = ["*"]
  }

  statement {
    actions = [
      "cognito-idp:DescribeUserPoolClient",
      "acm:ListCertificates",
      "acm:DescribeCertificate",
      "iam:ListServerCertificates",
      "iam:GetServerCertificate",
      "waf-regional:GetWebACL",
      "waf-regional:GetWebACLForResource",
      "waf-regional:AssociateWebACL",
      "waf-regional:DisassociateWebACL",
      "wafv2:GetWebACL",
      "wafv2:GetWebACLForResource",
      "wafv2:AssociateWebACL",
      "wafv2:DisassociateWebACL",
      "shield:GetSubscriptionState",
      "shield:DescribeProtection",
      "shield:CreateProtection",
      "shield:DeleteProtection",
    ]
    resources = ["*"]
  }

  statement {
    actions = [
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:RevokeSecurityGroupIngress",
    ]
    resources = ["*"]
  }

  statement {
    actions   = ["ec2:CreateSecurityGroup"]
    resources = ["*"]
  }

  statement {
    actions = ["ec2:CreateTags"]
    resources = [
      "arn:${data.aws_partition.aws_load_balancer_controller.partition}:ec2:*:*:security-group/*",
    ]

    condition {
      test     = "StringEquals"
      variable = "ec2:CreateAction"
      values   = ["CreateSecurityGroup"]
    }

    condition {
      test     = "Null"
      variable = "aws:RequestTag/elbv2.k8s.aws/cluster"
      values   = ["false"]
    }
  }

  statement {
    actions = [
      "ec2:CreateTags",
      "ec2:DeleteTags",
    ]
    resources = [
      "arn:${data.aws_partition.aws_load_balancer_controller.partition}:ec2:*:*:security-group/*",
    ]

    condition {
      test     = "Null"
      variable = "aws:RequestTag/elbv2.k8s.aws/cluster"
      values   = ["true"]
    }

    condition {
      test     = "Null"
      variable = "aws:ResourceTag/elbv2.k8s.aws/cluster"
      values   = ["false"]
    }
  }

  statement {
    actions = [
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:RevokeSecurityGroupIngress",
      "ec2:DeleteSecurityGroup",
    ]
    resources = ["*"]

    condition {
      test     = "Null"
      variable = "aws:ResourceTag/elbv2.k8s.aws/cluster"
      values   = ["false"]
    }
  }

  statement {
    actions = [
      "elasticloadbalancing:CreateLoadBalancer",
      "elasticloadbalancing:CreateTargetGroup",
    ]
    resources = ["*"]

    condition {
      test     = "Null"
      variable = "aws:RequestTag/elbv2.k8s.aws/cluster"
      values   = ["false"]
    }
  }

  statement {
    actions = [
      "elasticloadbalancing:CreateListener",
      "elasticloadbalancing:DeleteListener",
      "elasticloadbalancing:CreateRule",
      "elasticloadbalancing:DeleteRule",
    ]
    resources = ["*"]
  }

  statement {
    actions = [
      "elasticloadbalancing:AddTags",
      "elasticloadbalancing:RemoveTags",
    ]
    resources = [
      "arn:${data.aws_partition.aws_load_balancer_controller.partition}:elasticloadbalancing:*:*:targetgroup/*/*",
      "arn:${data.aws_partition.aws_load_balancer_controller.partition}:elasticloadbalancing:*:*:loadbalancer/net/*/*",
      "arn:${data.aws_partition.aws_load_balancer_controller.partition}:elasticloadbalancing:*:*:loadbalancer/app/*/*",
    ]

    condition {
      test     = "Null"
      variable = "aws:RequestTag/elbv2.k8s.aws/cluster"
      values   = ["true"]
    }

    condition {
      test     = "Null"
      variable = "aws:ResourceTag/elbv2.k8s.aws/cluster"
      values   = ["false"]
    }
  }

  statement {
    actions = [
      "elasticloadbalancing:AddTags",
      "elasticloadbalancing:RemoveTags",
    ]
    resources = [
      "arn:${data.aws_partition.aws_load_balancer_controller.partition}:elasticloadbalancing:*:*:listener/net/*/*/*",
      "arn:${data.aws_partition.aws_load_balancer_controller.partition}:elasticloadbalancing:*:*:listener/app/*/*/*",
      "arn:${data.aws_partition.aws_load_balancer_controller.partition}:elasticloadbalancing:*:*:listener-rule/net/*/*/*",
      "arn:${data.aws_partition.aws_load_balancer_controller.partition}:elasticloadbalancing:*:*:listener-rule/app/*/*/*",
    ]
  }

  statement {
    actions = [
      "elasticloadbalancing:ModifyLoadBalancerAttributes",
      "elasticloadbalancing:SetIpAddressType",
      "elasticloadbalancing:SetSecurityGroups",
      "elasticloadbalancing:SetSubnets",
      "elasticloadbalancing:DeleteLoadBalancer",
      "elasticloadbalancing:ModifyTargetGroup",
      "elasticloadbalancing:ModifyTargetGroupAttributes",
      "elasticloadbalancing:DeleteTargetGroup",
    ]
    resources = ["*"]

    condition {
      test     = "Null"
      variable = "aws:ResourceTag/elbv2.k8s.aws/cluster"
      values   = ["false"]
    }
  }

  statement {
    actions = ["elasticloadbalancing:AddTags"]
    resources = [
      "arn:${data.aws_partition.aws_load_balancer_controller.partition}:elasticloadbalancing:*:*:targetgroup/*/*",
      "arn:${data.aws_partition.aws_load_balancer_controller.partition}:elasticloadbalancing:*:*:loadbalancer/net/*/*",
      "arn:${data.aws_partition.aws_load_balancer_controller.partition}:elasticloadbalancing:*:*:loadbalancer/app/*/*",
    ]

    condition {
      test     = "StringEquals"
      variable = "elasticloadbalancing:CreateAction"
      values = [
        "CreateTargetGroup",
        "CreateLoadBalancer",
      ]
    }

    condition {
      test     = "Null"
      variable = "aws:RequestTag/elbv2.k8s.aws/cluster"
      values   = ["false"]
    }
  }

  statement {
    actions = [
      "elasticloadbalancing:RegisterTargets",
      "elasticloadbalancing:DeregisterTargets",
    ]
    resources = [
      "arn:${data.aws_partition.aws_load_balancer_controller.partition}:elasticloadbalancing:*:*:targetgroup/*/*",
    ]
  }

  statement {
    actions = [
      "elasticloadbalancing:SetWebAcl",
      "elasticloadbalancing:ModifyListener",
      "elasticloadbalancing:AddListenerCertificates",
      "elasticloadbalancing:RemoveListenerCertificates",
      "elasticloadbalancing:ModifyRule",
    ]
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "aws_load_balancer_controller" {
  source_policy_documents = [data.aws_iam_policy_document.aws_load_balancer_controller_base.json]

  dynamic "statement" {
    for_each = local.aws_load_balancer_controller_policy_statements

    content {
      actions   = statement.value.actions
      resources = statement.value.resources

      dynamic "condition" {
        for_each = try(statement.value.conditions, [])

        content {
          test     = condition.value.test
          variable = condition.value.variable
          values   = condition.value.values
        }
      }
    }
  }
}

resource "aws_iam_role" "aws_load_balancer_controller" {
  count = local.aws_load_balancer_controller.enabled ? 1 : 0

  name_prefix = "${local.aws_load_balancer_controller.role_name}-"
  path        = local.aws_load_balancer_controller.role_path
  description = local.aws_load_balancer_controller.role_description

  assume_role_policy    = data.aws_iam_policy_document.aws_load_balancer_controller_assume.json
  force_detach_policies = true
}

resource "aws_iam_policy" "aws_load_balancer_controller" {
  count = local.aws_load_balancer_controller.enabled ? 1 : 0

  name_prefix = "${local.aws_load_balancer_controller.role_name}-"
  path        = local.aws_load_balancer_controller.role_path
  description = local.aws_load_balancer_controller.policy_description
  policy      = data.aws_iam_policy_document.aws_load_balancer_controller.json
}

resource "aws_iam_role_policy_attachment" "aws_load_balancer_controller" {
  count = local.aws_load_balancer_controller.enabled ? 1 : 0

  role       = aws_iam_role.aws_load_balancer_controller[0].name
  policy_arn = aws_iam_policy.aws_load_balancer_controller[0].arn
}
