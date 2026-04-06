#============================================================
# Create a shared GatewayClass for AWS Load Balancer Controller-backed Gateways.
# Individual services should reference this class instead of creating their own.
#============================================================

resource "kubernetes_manifest" "gateway_class_aws_alb_load_balancer_configuration" {
  manifest = {
    apiVersion = "gateway.k8s.aws/v1beta1"
    kind       = "LoadBalancerConfiguration"
    metadata = {
      name      = "aws-alb"
      namespace = "kube-system"
    }
    spec = {
      scheme = "internet-facing"
      listenerConfigurations = [
        {
          protocolPort       = "HTTPS:443"
          defaultCertificate = local.ingress_certificate_arn
        }
      ]
    }
  }

  depends_on = [module.aws_load_balancer_controller_addon]
}

resource "kubernetes_manifest" "gateway_class_aws_alb" {
  manifest = {
    apiVersion = "gateway.networking.k8s.io/v1"
    kind       = "GatewayClass"
    metadata = {
      name = "aws-alb"
    }
    spec = {
      controllerName = "gateway.k8s.aws/alb"
      parametersRef = {
        group     = "gateway.k8s.aws"
        kind      = "LoadBalancerConfiguration"
        name      = "aws-alb"
        namespace = "kube-system"
      }
    }
  }

  depends_on = [
    module.aws_load_balancer_controller_addon,
    kubernetes_manifest.gateway_class_aws_alb_load_balancer_configuration,
  ]
}
