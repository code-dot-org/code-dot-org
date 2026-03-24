#==============================================================================
# Per-k8s-namespace ExternalSecret : cdo-external-secrets in kubernetes
#
# This syncs all secrets like {namespace}/cdo/* from AWS Secrets Manager into a
# single Kubernetes Secret named cdo-external-secrets.
#==============================================================================

resource "kubernetes_manifest" "cdo_external_secrets" {
  count = var.single_namespace_environment_type ? 1 : 0

  manifest = {
    apiVersion = "external-secrets.io/v1"
    kind       = "ExternalSecret"
    metadata = {
      name      = "cdo-external-secrets"
      namespace = var.environment_type
    }
    spec = {
      # Syncing every 5 minutes we expect to cost about $0.25/month per namespace.
      # Assumptions: 100 keys per sync, 5 BatchGetSecretValue calls, $0.05 per 10k calls.
      refreshInterval = var.aws_secrets_manager_refresh_interval
      secretStoreRef = {
        name = "aws-secrets-manager-store"
        kind = "SecretStore"
      }
      target = {
        # This will create the K8S Secret object cdo-external-secrets in each namespace
        # and sync it from AWS Secrets manager at refreshInterval
        name = "cdo-external-secrets"
      }
      dataFrom = [
        {
          find = {
            path = "${var.environment_type}/cdo"
          }
        }
      ]
    }
  }

  depends_on = [kubernetes_manifest.secret_store]
}

#==============================================================================
# ClusterExternalSecret fanout for multi-namespace env types like adhoc-*
#
# ClusterExternalSecret selects namespaces by label, not by regex. To have all
# adhoc-* namespaces receive this ExternalSecret, label them with:
# code.org/environment-type = adhoc
#==============================================================================

resource "kubernetes_manifest" "cdo_external_secrets_cluster_external_secret" {
  count = var.single_namespace_environment_type ? 0 : 1

  manifest = {
    apiVersion = "external-secrets.io/v1"
    kind       = "ClusterExternalSecret"
    metadata = {
      name = "cdo-external-secrets-${var.environment_type}"
    }
    spec = {
      externalSecretName = "cdo-external-secrets"
      namespaceSelectors = [
        {
          matchLabels = {
            "code.org/environment-type" = var.environment_type
          }
        }
      ]
      # Re-scan for matching namespaces frequently so new adhoc namespaces get
      # their ExternalSecret shortly after they are created and labeled.
      refreshTime = "1m"

      externalSecretSpec = {
        refreshInterval = var.aws_secrets_manager_refresh_interval
        secretStoreRef = {
          name = "aws-secrets-manager-store-${var.environment_type}"
          kind = "ClusterSecretStore"
        }
        target = {
          name = "cdo-external-secrets"
        }
        dataFrom = [
          {
            find = {
              path = "${var.environment_type}/cdo"
            }
          }
        ]
      }
    }
  }

  depends_on = [kubernetes_manifest.cluster_secret_store]
}
