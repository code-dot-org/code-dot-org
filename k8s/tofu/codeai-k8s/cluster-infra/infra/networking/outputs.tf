output "cluster_subdomain_wildcard_certificate_arn" {
  value = aws_acm_certificate_validation.cluster_subdomain_wildcard.certificate_arn
}

output "aws_load_balancer_controller_iam_role_arn" {
  value = module.aws_load_balancer_controller_addon.gitops_metadata.aws_load_balancer_controller_iam_role_arn
}
