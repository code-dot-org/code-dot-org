output "cluster_subdomain_wildcard_certificate_arn" {
  description = "ACM wildcard certificate ARN for cluster-hosted services (e.g. *.k8s.code.org)."
  value       = aws_acm_certificate_validation.cluster_subdomain_wildcard.certificate_arn
}

output "eso_iam_role_arns" {
  description = "IAM role ARNs for ESO stores by environment type."
  value = merge(
    { for env, mod in module.eso_per_env : env => mod.iam_role_arn },
    { adhoc = module.eso_per_adhoc.iam_role_arn }
  )
}
