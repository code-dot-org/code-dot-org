#============================================================
# External Secrets Operator (ESO)
#============================================================
#
# Lets use access AWS Secrets Manager secrets from Kubernetes
#
# Creates the AWS IAM roles and inline policies used by the ESO stores in later phases.

#------------------------------------------------------------
# Per-environment SecretStore + IAM role
#------------------------------------------------------------

data "aws_caller_identity" "current" {}

module "eso_per_env" {
  for_each = local.single_namespace_environment_types
  source   = "../modules/eso-per-env-aws"

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
  source = "../modules/eso-per-env-aws"

  environment_type                  = "adhoc"
  single_namespace_environment_type = false
  cluster_oidc_issuer_url           = local.cluster_oidc_issuer_url
  oidc_provider_arn                 = local.oidc_provider_arn
  aws_account_id                    = data.aws_caller_identity.current.account_id
  region                            = local.cluster_region
}
