# EKS does not currently expose aws-load-balancer-controller as a native aws_eks_addon name here,
# so this uses the AWS IA addons module path as the "addon mode".
module "aws_load_balancer_controller_addon" {
  source  = "aws-ia/eks-blueprints-addons/aws"
  version = "~> 1.13.0"

  cluster_name      = module.eks.cluster_name
  cluster_endpoint  = module.eks.cluster_endpoint
  cluster_version   = module.eks.cluster_version
  oidc_provider_arn = module.eks.oidc_provider_arn

  enable_aws_load_balancer_controller = true

  aws_load_balancer_controller = {
    set = [
      {
        name  = "region"
        value = var.region
      },
      {
        name  = "vpcId"
        value = var.vpc_id
      },
      {
        name  = "ingressClassConfig.default"
        value = "true"
      }
    ]
  }

  depends_on = [
    module.eks,
    # terraform_data.restart_coredns_after_deploy,
  ]
}
