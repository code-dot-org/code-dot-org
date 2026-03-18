output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_arn" {
  description = "EKS cluster ARN"
  value       = module.eks.cluster_arn
}

output "cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "Base64-encoded certificate authority data for the cluster"
  value       = module.eks.cluster_certificate_authority_data
}

output "cluster_version" {
  description = "Kubernetes version of the cluster"
  value       = module.eks.cluster_version
}

output "oidc_provider_arn" {
  description = "ARN of the OIDC provider for IRSA"
  value       = module.eks.oidc_provider_arn
}

output "cluster_oidc_issuer_url" {
  description = "OIDC issuer URL for the cluster"
  value       = module.eks.cluster_oidc_issuer_url
}

output "vpc_id" {
  description = "VPC ID used by the cluster"
  value       = var.vpc_id
}

output "cluster_region" {
  description = "AWS region of the EKS cluster"
  value       = var.region
}

output "kubectl_config_command" {
  description = "AWS CLI command to configure kubectl for this EKS cluster"
  value       = "aws eks update-kubeconfig --region ${var.region} --name ${module.eks.cluster_name}"
}

output "cluster_subdomain" {
  description = "Public DNS suffix for cluster-hosted services (e.g. k8s.code.org)."
  value       = "${var.cluster_subdomain}.${var.parent_domain}"
}

output "cluster_subdomain_route53_zone_id" {
  description = "Route 53 hosted zone ID for cluster subdomain (e.g. k8s.code.org)."
  value       = aws_route53_zone.cluster_subdomain.zone_id
}
