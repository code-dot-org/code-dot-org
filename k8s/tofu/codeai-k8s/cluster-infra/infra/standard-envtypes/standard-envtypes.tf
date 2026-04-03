#============================================================
# External Secrets Operator (ESO)
#============================================================
#
# Lets use access AWS Secrets Manager secrets from Kubernetes
#
# Creates the AWS IAM roles and inline policies used by the ESO stores in later phases.

locals {
  eso_iam_role_arns = merge(
    { for env, mod in module.eso_per_envtype : env => mod.iam_role_arn },
    { adhoc = module.eso_per_envtype_adhoc.iam_role_arn }
  )
}

#------------------------------------------------------------
# Per-environment SecretStore + IAM role
#------------------------------------------------------------

data "aws_caller_identity" "current" {}

module "eso_per_envtype" {
  for_each = var.single_namespace_environment_types
  source   = "./modules/eso-per-envtype"

  environment_type                  = each.value
  single_namespace_environment_type = true
  cluster_oidc_issuer_url           = var.cluster_oidc_issuer_url
  oidc_provider_arn                 = var.oidc_provider_arn
  aws_account_id                    = data.aws_caller_identity.current.account_id
  region                            = var.cluster_region
}

#------------------------------------------------------------
# Adhoc ClusterSecretStore + IAM role
#------------------------------------------------------------

module "eso_per_envtype_adhoc" {
  source = "./modules/eso-per-envtype"

  environment_type                  = "adhoc"
  single_namespace_environment_type = false
  cluster_oidc_issuer_url           = var.cluster_oidc_issuer_url
  oidc_provider_arn                 = var.oidc_provider_arn
  aws_account_id                    = data.aws_caller_identity.current.account_id
  region                            = var.cluster_region
}
