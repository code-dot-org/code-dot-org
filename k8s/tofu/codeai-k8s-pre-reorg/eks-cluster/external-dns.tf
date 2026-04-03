#============================================================
# Install ExternalDNS via the AWS IA add-on wrapper.
#
# This still deploys the upstream external-dns chart, but lets the module own
# the IRSA role/policy wiring for Route 53.
#============================================================

module "external_dns_addon" {
  source  = "aws-ia/eks-blueprints-addons/aws"
  version = "~> 1.23.0"

  cluster_name      = module.eks.cluster_name
  cluster_endpoint  = module.eks.cluster_endpoint
  cluster_version   = module.eks.cluster_version
  oidc_provider_arn = module.eks.oidc_provider_arn

  enable_external_dns = true

  # Limit Route53 write access to the delegated cluster zone (e.g. k8s.code.org)
  external_dns_route53_zone_arns = [
    "arn:aws:route53:::hostedzone/${aws_route53_zone.cluster_subdomain.zone_id}",
  ]

  external_dns = {
    chart_version = "1.20.0"

    values = [yamlencode({
      txtOwnerId = var.cluster_name

      # Create DNS for these Kubernetes resource types:
      sources = [
        "service",
        "ingress",
        "crd",
        "gateway-httproute",
        "gateway-grpcroute",
      ]

      # Only manage names under this suffix, e.g. k8s.code.org:
      domainFilters = [
        "${var.cluster_subdomain}.${var.parent_domain}",
      ]

      extraArgs = [
        "--aws-zone-type=public",

        # Setup ExternalDNS so if a Service or Ingress has label `code.ai/dns-name: <host name>`,
        # ExternalDNS will map it as <host name>.<cluster_subdomain>.<primary_domain>
        #
        # For example: `code.ai/dns-name: boo` => boo.k8s.code.org
        #
        "--fqdn-template={{ printf \"{{ with index .Labels %q }}{{ . }}{{ else }}ignore{{ end }}\" \"code.ai/dns-name\" }}.${var.cluster_subdomain}.${var.parent_domain}",
        "--exclude-domains=ignore.${var.cluster_subdomain}.${var.parent_domain}",
      ]
    })]
  }

  depends_on = [
    module.eks,
    kubectl_manifest.gateway_api_crds,
  ]
}
