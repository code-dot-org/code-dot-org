# TEMPORARILY DISABLED

# # EKS Fargate comes up with CoreDNS in a broken state by default.
# #
# # Even official AWS tutorials suggest restarting the CoreDNS deployment after cluster creation
# # as a manual imperative step. YUCK!

# resource "terraform_data" "restart_coredns_after_deploy" {
#   triggers_replace = {
#     cluster_arn = module.eks.cluster_arn
#   }

#   provisioner "local-exec" {
#     interpreter = ["/bin/bash", "-c"]
#     environment = {
#       CLUSTER_NAME = module.eks.cluster_name
#       REGION       = var.region
#     }
#     command = <<EOT
# set -euo pipefail

# kubeconfig="$(mktemp)"
# cleanup() {
#   rm -f "$kubeconfig"
# }
# trap cleanup EXIT

# aws eks update-kubeconfig \
#   --region "$REGION" \
#   --name "$CLUSTER_NAME" \
#   --dry-run > "$kubeconfig"

# kubectl \
#   --kubeconfig "$kubeconfig" \
#   rollout restart -n kube-system deployment coredns

# kubectl \
#   --kubeconfig "$kubeconfig" \
#   -n kube-system rollout status deployment/coredns --timeout=10m
# EOT
#   }

#   depends_on = [module.eks]
# }
