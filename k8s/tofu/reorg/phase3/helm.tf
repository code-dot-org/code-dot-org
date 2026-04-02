#============================================================
# Install Argo CD Helm Chart
#============================================================

resource "helm_release" "argocd" {
  name             = "argocd"
  chart            = "${path.module}/infra/argocd"
  namespace        = "argocd"
  create_namespace = true
}

#============================================================
# Install AWS Load Balancer Controller Helm chart.
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
# Align the vendored Gateway API CRDs in: ./infra/gateway/crds/standard-install.yaml.

resource "helm_release" "aws_load_balancer_controller" {
  name      = "aws-load-balancer-controller"
  chart     = "${path.module}/infra/aws-load-balancer-controller"
  namespace = "kube-system"
  wait      = false
}

#============================================================
# Create a shared GatewayClass for AWS Load Balancer Controller-backed Gateways.
# Individual services should reference this class instead of creating their own.
#============================================================

resource "helm_release" "gateway" {
  name      = "gateway-class-aws-alb"
  chart     = "${path.module}/infra/gateway"
  namespace = "kube-system"

  values = [yamlencode({
    loadBalancerConfiguration = {
      defaultCertificateArn = data.terraform_remote_state.phase2.outputs.cluster_subdomain_wildcard_certificate_arn
    }
  })]

  depends_on = [helm_release.aws_load_balancer_controller]
}

#============================================================
# Install ExternalDNS Helm chart.
#============================================================

resource "helm_release" "external_dns" {
  name             = "external-dns"
  chart            = "${path.module}/infra/external-dns"
  namespace        = "external-dns"
  create_namespace = false
  wait             = false

  depends_on = [
    helm_release.gateway,
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

  depends_on = [helm_release.argocd]
}

#============================================================
# Install Kargo GitHub webhook SecretStore chart.
#============================================================

resource "helm_release" "kargo_github_webhook" {
  name             = "kargo-github-webhook"
  chart            = "${path.module}/infra/kargo-github-webhook"
  namespace        = "kargo-system-resources"
  create_namespace = false
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
# 4) The Kubernetes-side ESO objects that use the IAM roles created in phase2

# Note we configure ESO here, but actually install the helm chart earlier in:
# ../eks-cluster/external-secrets-operator.tf

# For the Helm chart that now owns the Kubernetes object shapes, see:
# ./infra/eso-per-env/

#------------------------------------------------------------
# Per-environment SecretStore + IAM role
#------------------------------------------------------------

resource "helm_release" "eso_per_env" {
  for_each = toset(local.cluster_outs.single_namespace_environment_types)

  name      = "eso-per-env-${each.value}"
  chart     = "${path.module}/infra/eso-per-env"
  namespace = "external-secrets"

  values = [yamlencode({
    environment_type                  = each.value
    single_namespace_environment_type = true
    multi_namespace_regexes           = null
    iam_role_arn                      = data.terraform_remote_state.phase2.outputs.eso_iam_role_arns[each.value]
    region                            = data.terraform_remote_state.phase1.outputs.cluster_region
  })]
}

#------------------------------------------------------------
# Adhoc ClusterSecretStore + IAM role
#------------------------------------------------------------

resource "helm_release" "eso_per_adhoc" {
  name      = "eso-per-env-adhoc"
  chart     = "${path.module}/infra/eso-per-env"
  namespace = "external-secrets"

  values = [yamlencode({
    environment_type                  = "adhoc"
    single_namespace_environment_type = false
    multi_namespace_regexes           = ["^adhoc-.*"]
    iam_role_arn                      = data.terraform_remote_state.phase2.outputs.eso_iam_role_arns["adhoc"]
    region                            = data.terraform_remote_state.phase1.outputs.cluster_region
  })]
}
