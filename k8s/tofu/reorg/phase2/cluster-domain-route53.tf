# Lookup the route53 zoneid of the parent domain (=code.org)
data "aws_route53_zone" "parent_domain" {
  name         = local.parent_domain
  private_zone = false
}

# Create a new Route53 zone for our new subdomain
resource "aws_route53_zone" "cluster_subdomain" {
  name = local.cluster_subdomain
}

# Add an NS record to parent_domain (e.g. code.org) directing it
# to treat the nameservers from our new subdomain's route53 zone
# as authoritative for the subdomain (e.g. k8s.code.org)
resource "aws_route53_record" "cluster_domain_ns" {
  name    = local.cluster_subdomain
  type    = "NS"
  records = aws_route53_zone.cluster_subdomain.name_servers

  # paranoia: do not allow overwriting an existing NS record we don't manage
  allow_overwrite = false

  zone_id = data.aws_route53_zone.parent_domain.zone_id
  ttl     = 300
}
