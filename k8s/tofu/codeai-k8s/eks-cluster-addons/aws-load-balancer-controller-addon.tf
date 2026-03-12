# EKS does not currently expose aws-load-balancer-controller as a native aws_eks_addon name here,
# so this uses the AWS IA addons module path as the "addon mode".
module "aws_load_balancer_controller_addon" {
  source  = "aws-ia/eks-blueprints-addons/aws"
  version = "~> 1.13.0"

  cluster_name      = local.cluster_name
  cluster_endpoint  = local.cluster_endpoint
  cluster_version   = local.cluster_version
  oidc_provider_arn = local.oidc_provider_arn

  enable_aws_load_balancer_controller = true

  aws_load_balancer_controller = {
    set = [
      {
        name  = "region"
        value = var.region
      },
      {
        name  = "vpcId"
        value = local.vpc_id
      },
      {
        name  = "ingressClassConfig.default"
        value = "true"
      }
    ]
  }
}
