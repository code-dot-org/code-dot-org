output "cluster_subdomain_zone_id" {
  value = aws_route53_zone.cluster_subdomain.zone_id
}

output "external_dns_iam_role_arn" {
  value = module.external_dns_addon.gitops_metadata.external_dns_iam_role_arn
}
