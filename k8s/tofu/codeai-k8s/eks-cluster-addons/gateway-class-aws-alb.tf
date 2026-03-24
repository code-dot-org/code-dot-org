#============================================================
# Create a shared GatewayClass for AWS Load Balancer Controller-backed Gateways.
# Individual services should reference this class instead of creating their own.
#============================================================

resource "kubernetes_manifest" "gateway_class_aws_alb" {
  manifest = {
    apiVersion = "gateway.networking.k8s.io/v1"
    kind       = "GatewayClass"
    metadata = {
      name = "aws-alb"
    }
    spec = {
      controllerName = "gateway.k8s.aws/alb"
    }
  }

  depends_on = [module.aws_load_balancer_controller_addon]
}
