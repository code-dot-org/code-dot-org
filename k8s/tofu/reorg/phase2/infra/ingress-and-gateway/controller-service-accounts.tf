resource "kubernetes_service_account_v1" "aws_load_balancer_controller" {
  metadata {
    name      = "aws-load-balancer-controller-sa"
    namespace = "kube-system"

    annotations = {
      "eks.amazonaws.com/role-arn" = module.aws_load_balancer_controller_addon.gitops_metadata.aws_load_balancer_controller_iam_role_arn
    }
  }
}
