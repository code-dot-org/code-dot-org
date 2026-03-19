# Request a wildcard ACM certificate for cluster-hosted apps, e.g. *.k8s.code.org.
resource "aws_acm_certificate" "cluster_subdomain_wildcard" {
  domain_name       = "*.${var.cluster_subdomain}.${var.parent_domain}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cluster_subdomain_wildcard_certificate_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cluster_subdomain_wildcard.domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.cluster_subdomain.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "cluster_subdomain_wildcard" {
  certificate_arn = aws_acm_certificate.cluster_subdomain_wildcard.arn
  validation_record_fqdns = [
    for record in aws_route53_record.cluster_subdomain_wildcard_certificate_validation :
    record.fqdn
  ]
}
