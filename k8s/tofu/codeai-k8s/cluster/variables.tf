variable "cluster_name" {
  description = "EKS cluster name. Mirrors the CloudFormation stack-name-derived cluster name."
  type        = string
  default     = "codeai-k8s"
}

variable "region" {
  description = "AWS region for the cluster and supporting resources."
  type        = string
  default     = "us-east-1"
}

variable "parent_domain" {
  description = "Parent public Route 53 domain, e.g. code.org, cluster will use a subdomain of this domain"
  type        = string
  default     = "code.org"

  validation {
    condition     = trimspace(var.parent_domain) != ""
    error_message = "parent_domain must not be empty."
  }
}

variable "cluster_subdomain" {
  description = "Subdomain, e.g. k8s, delegated to the cluster for public service hostnames."
  type        = string
  default     = "k8s"

  validation {
    condition     = trimspace(var.cluster_subdomain) != ""
    error_message = "cluster_subdomain must not be empty."
  }
}

variable "kubernetes_version" {
  description = "Kubernetes version for the EKS cluster."
  type        = string
  default     = "1.35"
}

variable "cluster_admin_role_arns" {
  description = "IAM role ARNs granted EKS cluster-admin access and KMS key administration for secrets encryption."
  type        = list(string)
  default = [
    "arn:aws:iam::475661607190:role/Engineering_FullAccess",
    "arn:aws:iam::475661607190:role/GoogleSignInAdmin",
  ]
}

variable "cluster_readonly_role_arns" {
  description = "IAM role ARNs granted read-only EKS cluster access."
  type        = list(string)
  default = [
    "arn:aws:iam::475661607190:role/Engineering_ReadOnly",
  ]
}

variable "create_new_vpc" {
  description = "Create a new VPC and Internet Gateway or re-use existing ones?"
  type        = bool
}

variable "existing_vpc_id" {
  description = "Existing VPC ID to use for EKS, create_new_vpc must be false."
  type        = string
  default     = null
}

variable "existing_internet_gateway_id" {
  description = "Internet Gateway attached to the existing VPC for public subnet routes, create_new_vpc must be false."
  type        = string
  default     = null
}

variable "create_new_vpc_cidr" {
  description = "CIDR block for the VPC when create_new_vpc is true."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_1_cidr" {
  description = "CIDR block for public subnet 1."
  type        = string
  default     = "10.0.64.0/20"
}

variable "public_subnet_2_cidr" {
  description = "CIDR block for public subnet 2."
  type        = string
  default     = "10.0.80.0/20"
}

variable "private_subnet_1_cidr" {
  description = "CIDR block for private subnet 1."
  type        = string
  default     = "10.0.192.0/20"
}

variable "private_subnet_2_cidr" {
  description = "CIDR block for private subnet 2."
  type        = string
  default     = "10.0.208.0/20"
}

variable "single_namespace_environment_types" {
  description = "Environment types that each map to a single Kubernetes namespace."
  type        = set(string)
  default     = ["production", "staging", "test", "levelbuilder"]
}

variable "frontend_security_group_id" {
  description = "Security group to attach to EKS pods."
  type        = string
  default     = "sg-663a031e"
}

variable "frontend_security_group_namespaces" {
  description = "Namespaces whose EKS pods should get the frontend security group."
  type        = set(string)
  default     = ["production", "test", "levelbuilder"]

  validation {
    condition = alltrue([
      for namespace in var.frontend_security_group_namespaces :
      contains(var.single_namespace_environment_types, namespace)
    ])
    error_message = "frontend_security_group_namespaces must be a subset of single_namespace_environment_types."
  }
}
