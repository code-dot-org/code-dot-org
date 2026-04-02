#============================================================
# Install Argo CD Helm Chart
#============================================================

resource "helm_release" "argocd" {
  name             = "argocd"
  chart            = "${path.module}/charts/argocd"
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
# Align with gateway_api_version in: ../eks-cluster/gateway-api-crds.tf.

resource "helm_release" "aws_load_balancer_controller" {
  name      = "aws-load-balancer-controller"
  chart     = "${path.module}/charts/aws-load-balancer-controller"
  namespace = "kube-system"
  wait      = false
}

#============================================================
# Install ExternalDNS Helm chart.
#============================================================

resource "helm_release" "external_dns" {
  name             = "external-dns"
  chart            = "${path.module}/charts/external-dns"
  namespace        = "external-dns"
  create_namespace = false
  wait             = false

  depends_on = [
    kubectl_manifest.gateway_api_crds,
  ]
}

#============================================================
# Install Dex for cluster-wide OIDC login.
#============================================================

resource "helm_release" "dex" {
  name             = "dex"
  chart            = "${path.module}/charts/dex"
  namespace        = "dex"
  create_namespace = false

  depends_on = [helm_release.argocd]
}

#============================================================
# Install Kargo GitHub webhook SecretStore chart.
#============================================================

resource "helm_release" "kargo_github_webhook" {
  name             = "kargo-github-webhook"
  chart            = "${path.module}/charts/kargo-github-webhook"
  namespace        = "kargo-system-resources"
  create_namespace = false
}

resource "helm_release" "kargo_github_webhook_secret" {
  name             = "kargo-github-webhook-secret"
  chart            = "${path.module}/charts/kargo-github-webhook-secret"
  namespace        = "kargo-system-resources"
  create_namespace = false

  depends_on = [helm_release.kargo_github_webhook]
}
