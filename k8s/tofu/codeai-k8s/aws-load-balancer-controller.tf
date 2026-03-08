locals {
  aws_load_balancer_controller_role_name   = "${var.cluster_name}-aws-load-balancer-controller"
  aws_load_balancer_controller_version_tag = "v${var.aws_load_balancer_controller_chart_version}"
}

data "http" "aws_load_balancer_controller_iam_policy" {
  url = "https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/${local.aws_load_balancer_controller_version_tag}/docs/install/iam_policy.json"
}

data "aws_iam_policy_document" "aws_load_balancer_controller_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [module.eks.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${module.eks.oidc_provider}:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "${module.eks.oidc_provider}:sub"
      values   = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
    }
  }
}

resource "aws_iam_role" "aws_load_balancer_controller" {
  name               = local.aws_load_balancer_controller_role_name
  assume_role_policy = data.aws_iam_policy_document.aws_load_balancer_controller_assume_role.json
}

resource "aws_iam_policy" "aws_load_balancer_controller" {
  name   = "${var.cluster_name}-AWSLoadBalancerControllerIAMPolicy"
  policy = data.http.aws_load_balancer_controller_iam_policy.response_body
}

resource "aws_iam_role_policy_attachment" "aws_load_balancer_controller_iam_policy" {
  role       = aws_iam_role.aws_load_balancer_controller.name
  policy_arn = aws_iam_policy.aws_load_balancer_controller.arn
}

resource "helm_release" "aws_load_balancer_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"
  version    = var.aws_load_balancer_controller_chart_version

  values = [yamlencode({
    clusterName = module.eks.cluster_name
    region      = var.region
    vpcId       = var.vpc_id
    ingressClassConfig = {
      default = true
    }
    serviceAccount = {
      create = true
      name   = "aws-load-balancer-controller"
      annotations = {
        "eks.amazonaws.com/role-arn" = aws_iam_role.aws_load_balancer_controller.arn
      }
    }
  })]

  depends_on = [
    module.eks,
    terraform_data.restart_coredns_after_deploy,
    aws_iam_role_policy_attachment.aws_load_balancer_controller_iam_policy,
  ]
}
