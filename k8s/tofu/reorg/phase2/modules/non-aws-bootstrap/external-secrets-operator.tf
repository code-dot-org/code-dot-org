#============================================================
# Install External Secrets Operator (ESO) Helm Chart
#============================================================

# Note we install the chart here to get the CRDs and controller in place. Later
# roots create the SecretStore and ExternalSecret objects that consume it.

resource "helm_release" "external_secrets" {
  name             = "external-secrets"
  repository       = "https://charts.external-secrets.io"
  chart            = "external-secrets"
  version          = "2.1.0"
  namespace        = "external-secrets"
  create_namespace = true

  set {
    name  = "installCRDs"
    value = "true"
  }

  # EKS Fargate reserves port 10250 for the kubelet. The chart defaults the
  # webhook to 10250, which causes the apiserver to hit the kubelet and fail
  # TLS validation instead of reaching the ESO webhook.
  set {
    name  = "webhook.port"
    value = "9443"
  }
}
