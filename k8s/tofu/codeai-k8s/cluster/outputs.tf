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

output "cluster_primary_security_group_id" {
  description = "EKS cluster primary security group ID"
  value       = module.eks.cluster_primary_security_group_id
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
  value       = local.vpc_id
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

output "parent_domain" {
  description = "Parent public Route 53 domain for the cluster."
  value       = var.parent_domain
}

output "cluster_subdomain_label" {
  description = "Subdomain label delegated to the cluster, e.g. k8s."
  value       = var.cluster_subdomain
}

output "single_namespace_environment_types" {
  description = "Environment types that each map to a single Kubernetes namespace."
  value       = sort(tolist(var.single_namespace_environment_types))
}

output "frontend_security_group_id" {
  description = "Frontend security group ID for EKS pods"
  value       = var.frontend_security_group_id
}

output "frontend_security_group_namespaces" {
  description = "Namespaces whose EKS pods should get the frontend security group."
  value       = sort(tolist(var.frontend_security_group_namespaces))
}
