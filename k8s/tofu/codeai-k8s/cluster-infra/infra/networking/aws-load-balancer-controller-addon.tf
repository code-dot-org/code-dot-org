# EKS does not currently expose aws-load-balancer-controller as a native
# aws_eks_addon name here, so this uses the AWS IA addons module path for the
# IRSA role and policy only. The Helm release lives in cluster-infra-argocd.
#
# You can find the latest AWS Load Balancer Controller release here:
# https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases
#
# Once you know your controller release version (for example v2.17.1), use it
# to find:
# 1. Gateway API version:
#    https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/v2.17.1/docs/guide/gateway/gateway.md?plain=1#L19
# 2. Helm chart version:
#    https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/v2.17.1/helm/aws-load-balancer-controller/Chart.yaml#L1-L9
#
# The AWS IA module's built-in IAM policy lags the controller chart and is
# missing several permissions required by AWS LBC v2.17.1.
# Upstream v2.17.1 IAM policy reference:
# https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.17.1/docs/install/iam_policy.json

module "aws_load_balancer_controller_addon" {
  source  = "aws-ia/eks-blueprints-addons/aws"
  version = "~> 1.13.0"

  create_kubernetes_resources = false

  cluster_name      = var.cluster_name
  cluster_endpoint  = var.cluster_endpoint
  cluster_version   = var.cluster_version
  oidc_provider_arn = var.oidc_provider_arn

  enable_aws_load_balancer_controller = true

  aws_load_balancer_controller = {
    policy_statements = [
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
}
