# NOTE: the ONLY external source allowed to parameterize the Helm
# values for charts in this file is local.codeai_cluster_config.*
# if you need a value that's not already there, you'll need to
# pipe it into that file in ../cluster-infra/codeai-cluster-confirmap.tf
# and here in ./load-codeai-cluster-configmap.tf.
#
# local.codeai_cluster_config can also be accessed in the k8s world
# as ConfigMap codeai_cluster_config in kube-system.

#============================================================
# Install External Secrets Operator (ESO) Helm chart.
#============================================================

resource "helm_release" "external_secrets_operator" {
  name             = "external-secrets-operator"
  chart            = "${path.module}/infra/external-secrets-operator"
  namespace        = "external-secrets"
  create_namespace = true

  depends_on = [helm_release.networking]
}

#============================================================
# Install Argo CD Helm Chart
#============================================================

resource "helm_release" "argocd" {
  name             = "argocd"
  chart            = "${path.module}/infra/argocd"
  namespace        = "argocd"
  create_namespace = true

  # TODO: remove this block if it proves unnecessary. This should already be
  # covered by the default `aws-alb` IngressClass plus
  # `IngressClassParams.spec.certificateArn` from `networking`.
  # values = [yamlencode({
  #   "argo-cd" = {
  #     server = {
  #       ingress = {
  #         annotations = {
  #           "alb.ingress.kubernetes.io/certificate-arn" = local.codeai_cluster_config.cluster_subdomain_wildcard_certificate_arn
  #         }
  #       }
  #     }
  #   }
  # })]

  depends_on = [helm_release.external_secrets_operator]
}

#============================================================
# Install AWS Load Balancer Controller, Gateway API CRDs, and the shared
# GatewayClass resources in one release.
#============================================================
#
# You can find  the latest release of AWS Load Balancer Controller (e.g. v2.17.1), here:
# https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases
#
# Once you know your AWS Load Balancer Controller release version (e.g. v2.17.1),
# you can plug it in to these urls to find:
# 1. Find Gateway API version (e.g. v1.5.0) here:
#    https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/v2.17.1/docs/guide/gateway/gateway.md?plain=1#L19
# 2. Find Helm Chart version (e.g. v1.17.1) here:
#    https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/v2.17.1/helm/aws-load-balancer-controller/Chart.yaml#L1-L9
#
# Align the vendored Gateway API CRDs in: ./infra/networking/crds/standard-install.yaml.

resource "helm_release" "networking" {
  name      = "networking"
  chart     = "${path.module}/infra/networking"
  namespace = "kube-system"

  values = [yamlencode({
    "aws-load-balancer-controller" = {
      ingressClassParams = {
        spec = {
          certificateArn = [local.codeai_cluster_config.cluster_subdomain_wildcard_certificate_arn]
        }
      }
    }
    gateway = {
      loadBalancerConfig = {
        defaultCertificateArn = local.codeai_cluster_config.cluster_subdomain_wildcard_certificate_arn
      }
    }
  })]
}

#============================================================
# Install ExternalDNS Helm chart.
#============================================================

resource "helm_release" "external_dns" {
  name             = "external-dns"
  chart            = "${path.module}/infra/external-dns"
  namespace        = "external-dns"
  create_namespace = false

  depends_on = [
    helm_release.networking,
  ]
}

#============================================================
# Install Dex for cluster-wide OIDC login.
#============================================================

resource "helm_release" "dex" {
  name             = "dex"
  chart            = "${path.module}/infra/dex"
  namespace        = "dex"
  create_namespace = false

  values = [yamlencode({
    dexGoogleClient = {
      clientID = local.codeai_cluster_config.dex_google_client_id
    }
  })]

  # TODO: remove this block if it proves unnecessary. This should already be
  # covered by the default `aws-alb` IngressClass plus
  # `IngressClassParams.spec.certificateArn` from `networking`.
  # values = [yamlencode({
  #   dex = {
  #     ingress = {
  #       annotations = {
  #         "alb.ingress.kubernetes.io/certificate-arn" = local.codeai_cluster_config.cluster_subdomain_wildcard_certificate_arn
  #       }
  #     }
  #   }
  # })]

  depends_on = [
    helm_release.argocd,
    helm_release.external_secrets_operator,
  ]
}

#============================================================
# Install Kargo secrets chart.
#============================================================

resource "helm_release" "kargo_secrets" {
  name             = "kargo-secrets"
  chart            = "${path.module}/infra/kargo-secrets"
  namespace        = "kargo-system-resources"
  create_namespace = false

  values = [yamlencode({
    sharedResources = {
      clusterName   = local.codeai_cluster_config.cluster_name
      clusterRegion = local.codeai_cluster_config.cluster_region
      iamRoleArn    = local.codeai_cluster_config.kargo_external_secret_stores_iam_role_arn
    }
    systemResources = {
      secretStore = {
        awsRegion = local.codeai_cluster_config.cluster_region
      }
    }
  })]

  depends_on = [helm_release.external_secrets_operator]
}


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
# 4) The Kubernetes-side ESO objects that use the IAM roles created in cluster-infra

# For the Helm charts that now own the Kubernetes object shapes, see:
# ./infra/eso-per-envtype/ and ./infra/standard-envtypes/

resource "helm_release" "standard_envtypes" {
  name      = "standard-envtypes"
  chart     = "${path.module}/infra/standard-envtypes"
  namespace = "external-secrets"

  values = [yamlencode({
    codeai_cluster_config = {
      single_namespace_environment_types = local.codeai_cluster_config.single_namespace_environment_types
      cluster_region                     = local.codeai_cluster_config.cluster_region
      eso_iam_role_arns                  = local.codeai_cluster_config.eso_iam_role_arns
      frontend_security_group_namespaces = local.codeai_cluster_config.frontend_security_group_namespaces
      cluster_primary_security_group_id  = local.codeai_cluster_config.cluster_primary_security_group_id
      frontend_security_group_id         = local.codeai_cluster_config.frontend_security_group_id
    }
  })]

  depends_on = [helm_release.external_secrets_operator]
}
