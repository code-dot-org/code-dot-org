#============================================================
# External Secrets Operator (ESO)
#============================================================
#
# Lets use access AWS Secrets Manager secrets from Kubernetes
#
# Creates:
# 1) A namespace-scoped aws-secrets-manager-store SecretStore per environment_type (production, staging, test, levelbuilder)
# 2) An adhoc-* scoped aws-secrets-manager-store-adhoc ClusterSecretStore for adhocs
# 3) A cdo-external-secrets ExternalSecret per single-namespace env type, plus a ClusterExternalSecret fanout for adhoc namespaces
# 4) An IAM role for each secret store restricting it to read secrets with pattern cdo/${environment_type}/* from AWS Secrets Manager

# Note we configure ESO here, but actually install the helm chart earlier in:
# ../eks-cluster/external-secrets-operator.tf

# For the OpenTofu resource that actually triggers secrets to be synced, see:
# ./modules/eso-per-env/cdo-external-secrets.tf

#------------------------------------------------------------
# Per-environment SecretStore + IAM role
#------------------------------------------------------------

data "aws_caller_identity" "current" {}

locals {
  cluster_oidc_issuer_url = data.terraform_remote_state.eks_cluster.outputs.cluster_oidc_issuer_url
}

module "eso_per_env" {
  for_each = local.single_namespace_environment_types
  source   = "./modules/eso-per-env"

  environment_type                  = each.value
  single_namespace_environment_type = true
  cluster_oidc_issuer_url           = local.cluster_oidc_issuer_url
  oidc_provider_arn                 = local.oidc_provider_arn
  aws_account_id                    = data.aws_caller_identity.current.account_id
  region                            = local.cluster_region
}

#------------------------------------------------------------
# Adhoc ClusterSecretStore + IAM role
#------------------------------------------------------------

module "eso_per_adhoc" {
  source = "./modules/eso-per-env"

  environment_type                  = "adhoc"
  single_namespace_environment_type = false
  multi_namespace_regexes           = ["^adhoc-.*"]
  cluster_oidc_issuer_url           = local.cluster_oidc_issuer_url
  oidc_provider_arn                 = local.oidc_provider_arn
  aws_account_id                    = data.aws_caller_identity.current.account_id
  region                            = local.cluster_region
}
