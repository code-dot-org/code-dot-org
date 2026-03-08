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

variable "kubernetes_version" {
  description = "Kubernetes version for the EKS cluster."
  type        = string
  default     = "1.35"
}

variable "vpc_id" {
  description = "Existing VPC ID to use for EKS and subnet resources."
  type        = string
  default     = "vpc-6e98810a"
}

variable "internet_gateway_id" {
  description = "Internet Gateway attached to the existing VPC for public subnet routes."
  type        = string
  default     = "igw-04a32960"
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

variable "aws_load_balancer_controller_chart_version" {
  description = "Helm chart version for the AWS Load Balancer Controller."
  type        = string
  default     = "3.1.0"
}
