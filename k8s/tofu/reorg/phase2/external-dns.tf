#============================================================
# Configure ExternalDNS IRSA via the AWS IA add-on wrapper.
#
# The Helm release lives in phase3. This root only keeps the AWS-side Route 53
# policy scope and IRSA role wiring.
#============================================================

module "external_dns_addon" {
  source  = "aws-ia/eks-blueprints-addons/aws"
  version = "~> 1.23.0"

  cluster_name      = local.cluster_name
  cluster_endpoint  = local.cluster_endpoint
  cluster_version   = local.cluster_outs.cluster_version
  oidc_provider_arn = local.oidc_provider_arn
  observability_tag = null

  create_kubernetes_resources = false

  enable_external_dns = true

  # Limit Route53 write access to the delegated cluster zone (e.g. k8s.code.org)
  external_dns_route53_zone_arns = [
    "arn:aws:route53:::hostedzone/${aws_route53_zone.cluster_subdomain.zone_id}",
  ]
}
