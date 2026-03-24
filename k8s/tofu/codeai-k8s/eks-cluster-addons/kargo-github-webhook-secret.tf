#============================================================
# Kargo GitHub organization webhook secret via AWS Secrets Manager + ESO
#============================================================
#
# This creates:
# 1) An AWS Secrets Manager secret at:
#    k8s/tofu/${cluster_name}/kargo/github_org_webhook_secret
# 2) An ExternalSecret in namespace kargo-system-resources
# 3) A Kubernetes secret named github-org-webhook-secret for ClusterConfig

resource "kubernetes_manifest" "kargo_github_webhook_external_secret" {
  manifest = {
    apiVersion = "external-secrets.io/v1"
    kind       = "ExternalSecret"
    metadata = {
      name      = local.kargo_github_webhook_secret_name
      namespace = local.kargo_system_resources_namespace_name
    }
    spec = {
      refreshInterval = "5m"
      secretStoreRef = {
        name = local.kargo_system_resources_secret_store_name
        kind = "SecretStore"
      }
      target = {
        name           = local.kargo_github_webhook_secret_name
        creationPolicy = "Owner"
        template = {
          engineVersion = "v2"
          metadata = {
            labels = {
              "kargo.akuity.io/cred-type" = "generic"
            }
          }
        }
      }
      data = [
        {
          secretKey = "secret"
          remoteRef = {
            key = module.kargo_github_org_webhook_secret.aws_secret_name
          }
        }
      ]
    }
  }

  depends_on = [
    kubernetes_manifest.kargo_system_resources_secret_store,
    module.kargo_github_org_webhook_secret,
  ]
}

#==============================================================
# Bootstrap Secret to AWS Secrets Manager (if variable set)
#==============================================================

module "kargo_github_org_webhook_secret" {
  source = "../../modules/bootstrapped-aws-secret"

  aws_secret_name           = local.kargo_github_webhook_secret_aws_name
  secret_value_to_bootstrap = var.kargo_github_org_webhook_secret
}
