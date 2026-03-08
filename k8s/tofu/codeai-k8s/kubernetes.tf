data "aws_eks_cluster" "cluster" {
  name = module.eks.cluster_name

  depends_on = [module.eks]
}
