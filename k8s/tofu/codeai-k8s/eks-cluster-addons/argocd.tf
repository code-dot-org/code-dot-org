#============================================================
# Install Argo CD Helm Chart
#============================================================

resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = "9.4.11"
  namespace        = "argocd"
  create_namespace = true

  values = [yamlencode({
    global = {
      domain = local.argocd_hostname
    }

    configs = {
      params = {
        # TLS terminates at the ALB, so argocd-server should speak plain HTTP to the ingress backend.
        "admin.enabled"   = false
        "server.insecure" = true
      }

      cm = {
        url = "https://${local.argocd_hostname}"
        "oidc.config" = yamlencode({
          name         = "Dex"
          issuer       = "https://${local.dex_hostname}"
          clientID     = "argocd"
          clientSecret = "$dex.argocd.clientSecret"
          requestedScopes = [
            "openid",
            "profile",
            "email",
          ]
        })
      }

      rbac = {
        "policy.default" = "role:admin"
      }

      secret = {
        extra = {
          "dex.argocd.clientSecret" = random_password.dex_client_secret_argocd.result
        }
      }
    }

    server = {
      ingress = {
        enabled          = true
        controller       = "generic"
        ingressClassName = "alb"
        hostname         = local.argocd_hostname
        annotations = {
          "alb.ingress.kubernetes.io/scheme"           = "internet-facing"
          "alb.ingress.kubernetes.io/target-type"      = "ip"
          "alb.ingress.kubernetes.io/certificate-arn"  = local.ingress_certificate_arn
          "alb.ingress.kubernetes.io/listen-ports"     = "[{\"HTTP\":80},{\"HTTPS\":443}]"
          "alb.ingress.kubernetes.io/ssl-redirect"     = "443"
          "alb.ingress.kubernetes.io/backend-protocol" = "HTTP"
        }
      }
    }
  })]

  set {
    name  = "crds.install"
    value = "true"
  }
}
