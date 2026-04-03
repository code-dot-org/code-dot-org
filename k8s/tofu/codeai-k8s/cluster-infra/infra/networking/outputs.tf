output "cluster_subdomain_wildcard_certificate_arn" {
  value = aws_acm_certificate_validation.cluster_subdomain_wildcard.certificate_arn
}
