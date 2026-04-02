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
# 4) The Kubernetes-side ESO objects that use the IAM roles created in phase2

# Note we configure ESO here, but actually install the helm chart earlier in:
# ../eks-cluster/external-secrets-operator.tf

# For the OpenTofu resource that actually triggers secrets to be synced, see:
# ../modules/eso-per-env-k8s/cdo-external-secrets.tf

#------------------------------------------------------------
# Per-environment SecretStore + IAM role
#------------------------------------------------------------

module "eso_per_env" {
  for_each = local.single_namespace_environment_types
  source   = "../modules/eso-per-env-k8s"

  environment_type                  = each.value
  single_namespace_environment_type = true
  iam_role_arn                      = data.terraform_remote_state.phase2.outputs.eso_iam_role_arns[each.value]
  region                            = local.cluster_region
}

#------------------------------------------------------------
# Adhoc ClusterSecretStore + IAM role
#------------------------------------------------------------

module "eso_per_adhoc" {
  source = "../modules/eso-per-env-k8s"

  environment_type                  = "adhoc"
  single_namespace_environment_type = false
  multi_namespace_regexes           = ["^adhoc-.*"]
  iam_role_arn                      = data.terraform_remote_state.phase2.outputs.eso_iam_role_arns["adhoc"]
  region                            = local.cluster_region
}
