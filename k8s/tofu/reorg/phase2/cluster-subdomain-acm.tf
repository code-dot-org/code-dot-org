# Request a wildcard ACM certificate for cluster-hosted apps, e.g. *.k8s.code.org,
# plus one wildcard per single-namespace environment type, e.g. *.staging.k8s.code.org,
# and adhoc namespaces, e.g. *.adhoc.k8s.code.org.
resource "aws_acm_certificate" "cluster_subdomain_wildcard" {
  domain_name = "*.${local.cluster_subdomain}"
  subject_alternative_names = concat(
    [
      for env_type in sort(tolist(local.single_namespace_environment_types)) :
      "*.${env_type}.${local.cluster_subdomain}"
    ],
    ["*.adhoc.${local.cluster_subdomain}"]
  )
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
