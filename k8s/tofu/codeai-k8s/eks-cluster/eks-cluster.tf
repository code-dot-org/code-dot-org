#============================================================
# EKS Kubernetes Cluster: codeai-k8s
#============================================================

locals {
  production_namespace = "production"

  non_prod_single_namespace_environment_types = [
    for namespace in sort(tolist(var.single_namespace_environment_types)) : namespace
    if namespace != local.production_namespace
  ]

  non_prod_fargate_namespaces = concat(
    local.non_prod_single_namespace_environment_types,
    ["adhoc-*"]
  )
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name               = var.cluster_name
  kubernetes_version = var.kubernetes_version

  kms_key_administrators = var.cluster_admin_role_arns

  # See: ./eks-cluster-networking.tf
  vpc_id = local.vpc_id
  subnet_ids = [
    aws_subnet.public_1.id,
    aws_subnet.public_2.id,
    aws_subnet.private_1.id,
    aws_subnet.private_2.id,
  ]

  # Fargate pods use the cluster primary security group, not a node SG:
  create_node_security_group = false
  endpoint_public_access     = true

  #=============================================================
  # Map AWS IAM roles to cluster permissions (affects kubectl)
  #=============================================================
  access_entries = merge(
    { for arn in var.cluster_readonly_role_arns : arn => {
      principal_arn = arn
      policy_associations = {
        cluster_view = {
          policy_arn   = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSViewPolicy"
          access_scope = { type = "cluster" }
        }
      }
    } },
    { for arn in var.cluster_admin_role_arns : arn => {
      principal_arn = arn
      policy_associations = {
        cluster_admin = {
          policy_arn   = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = { type = "cluster" }
        }
      }
    } }
  )

  #=============================================================
  # Core EKS managed addons
  #=============================================================
  addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
  }

  #============================================================
  # Fargate profiles: which namespaces run on Fargate?
  #============================================================

  # If you need more specific settings for a namespace, create a new profile.
  # zz-default is our default fargate profile that matches all namespaces (*)
  fargate_profiles = {
    # Production gets its own profile for isolation and independent lifecycle management.
    # Its quite possible we'll want to break production into its own cluster eventually.
    # But for now, a separate profile is simple and cost-effective.
    production = {
      name       = "production"
      subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
      selectors  = [{ namespace = local.production_namespace }]
    }

    # Staging, test, levelbuilder, and adhoc-* deployments share a profile.
    non-prod = {
      name       = "non-prod"
      subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
      selectors = [
        for namespace in local.non_prod_fargate_namespaces : { namespace = namespace }
      ]
    }

    default = {
      # When multiple fargate profiles match a namespace, it picks by alphanumeric order.
      # Using the "zz-" prefix means this one matches last, i.e. it's the fallback profile
      # if a more specific namespace match can't be found (e.g. kube-system, external-secrets).
      name       = "zz-default"
      subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
      selectors = [
        { namespace = "*" }
      ]
    }
  }

}
