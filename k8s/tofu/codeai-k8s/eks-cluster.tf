#============================================================
# EKS Kubernetes Cluster: codeai-k8s
#============================================================

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name               = var.cluster_name
  kubernetes_version = var.kubernetes_version

  # See: ./eks-cluster-networking.tf
  vpc_id = var.vpc_id
  subnet_ids = [
    aws_subnet.public_1.id,
    aws_subnet.public_2.id,
    aws_subnet.private_1.id,
    aws_subnet.private_2.id,
  ]

  # Fargate pods use the cluster primary security group, not a node SG:
  create_node_security_group = false

  #=============================================================
  # Map AWS IAM roles to cluster permissions (affects kubectl)
  #=============================================================
  access_entries = {
    engineering_read_only = {
      principal_arn = "arn:aws:iam::475661607190:role/Engineering_ReadOnly"
      policy_associations = {
        cluster_view = {
          policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSViewPolicy"
          access_scope = {
            type = "cluster"
          }
        }
      }
    }
    engineering_full_access = {
      principal_arn = "arn:aws:iam::475661607190:role/Engineering_FullAccess"
      policy_associations = {
        cluster_admin = {
          policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = {
            type = "cluster"
          }
        }
      }
    }
  }

  #============================================================
  # Fargate profiles: which namespaces run on Fargate?
  #============================================================

  # If you need more specific settings for a namespace, create a new profile.
  # zz-default is our default fargate profile that matches all namespaces (*)
  fargate_profiles = {
    default = {
      # When multiple fargate profiles match a namespace, it picks by alphanumeric order
      # Using the "zz-" prefix means this one matches last, i.e. its the fallback profile
      # if a more specific namespace match can't be found.
      name       = "zz-default"
      subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
      selectors = [
        {
          namespace = "*"
        }
      ]
    }
  }

  depends_on = [
    aws_route_table_association.public_1,
    aws_route_table_association.public_2,
    aws_route_table_association.private_1,
    aws_route_table_association.private_2,
    aws_route.public_internet,
    aws_route.private_1_nat,
    aws_route.private_2_nat,
  ]
}
