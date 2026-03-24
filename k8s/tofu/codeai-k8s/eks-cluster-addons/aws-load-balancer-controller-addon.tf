# EKS does not currently expose aws-load-balancer-controller as a native aws_eks_addon name here,
# so this uses the AWS IA addons module path as the "addon mode".
locals {
  # You can find  the latest release of AWS Load Balancer Controller (e.g. v2.17.1), here:
  # https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases
  #
  # Once you know your AWS Load Balancer Controller release version (e.g. v2.17.1),
  # you can plug it in to these urls to find:
  # 1. Find Gateway API version (e.g. v1.5.0) here: 
  #    https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/v2.17.1/docs/guide/gateway/gateway.md?plain=1#L19
  # 2. Find Helm Chart version (e.g. v1.17.1) here:
  #    https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/v2.17.1/helm/aws-load-balancer-controller/Chart.yaml#L1-L9

  # Align with gateway_api_version in: ../eks-cluster/gateway-api-crds.tf:
  aws_load_balancer_controller_chart_version = "1.17.1"
  cluster_version                            = data.terraform_remote_state.eks_cluster.outputs.cluster_version
  vpc_id                                     = data.terraform_remote_state.eks_cluster.outputs.vpc_id

  # The AWS IA module's built-in IAM policy lags the controller chart and is
  # missing several permissions required by AWS LBC v2.17.1.
  # Upstream v2.17.1 IAM policy reference:
  # https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.17.1/docs/install/iam_policy.json
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

module "aws_load_balancer_controller_addon" {
  source  = "aws-ia/eks-blueprints-addons/aws"
  version = "~> 1.13.0"

  cluster_name      = local.cluster_name
  cluster_endpoint  = local.cluster_endpoint
  cluster_version   = local.cluster_version
  oidc_provider_arn = local.oidc_provider_arn

  enable_aws_load_balancer_controller = true

  aws_load_balancer_controller = {
    chart_version     = local.aws_load_balancer_controller_chart_version
    policy_statements = local.aws_load_balancer_controller_policy_statements

    set = [
      {
        name  = "region"
        value = local.cluster_region
      },
      {
        name  = "vpcId"
        value = local.vpc_id
      },
      {
        name  = "ingressClass"
        value = "aws-alb"
      },
      {
        name  = "ingressClassParams.name"
        value = "aws-alb"
      },
      {
        name  = "ingressClassParams.spec.scheme"
        value = "internet-facing"
      },
      {
        name  = "ingressClassParams.spec.certificateArn[0]"
        value = local.ingress_certificate_arn
      },
      {
        name  = "ingressClassParams.spec.targetType"
        value = "ip"
      },
      {
        name  = "ingressClassParams.spec.sslRedirectPort"
        value = "443"
      },
      {
        name  = "ingressClassConfig.default"
        value = "true"
      },
      {
        name  = "controllerConfig.featureGates.ALBGatewayAPI"
        value = "true"
      }
    ]
  }
}
