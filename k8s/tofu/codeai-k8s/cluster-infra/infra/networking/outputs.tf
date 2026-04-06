output "cluster_subdomain_wildcard_certificate_arn" {
  value = aws_acm_certificate_validation.cluster_subdomain_wildcard.certificate_arn
}

output "aws_load_balancer_controller_iam_role_arn" {
  value = aws_iam_role.aws_load_balancer_controller[0].arn
}
