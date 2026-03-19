#============================================================
# Install Dex for cluster-wide OIDC login
#============================================================

resource "helm_release" "dex" {
  name             = "dex"
  repository       = "https://charts.dexidp.io"
  chart            = "dex"
  version          = "0.24.0"
  namespace        = "dex"
  create_namespace = true

  values = [yamlencode({
    config = {
      issuer = "https://${local.dex_hostname}"

      storage = {
        type = "kubernetes"
        config = {
          inCluster = true
        }
      }

      oauth2 = {
        skipApprovalScreen = true
      }

      staticClients = [
        {
          id           = "argocd"
          name         = "Argo CD"
          secret       = random_password.dex_client_secret_argocd.result
          redirectURIs = ["https://${local.argocd_hostname}/auth/callback"]
        }
      ]

      connectors = [
        {
          type = "google"
          id   = "google"
          name = "Google"
          config = {
            clientID      = var.dex_google_client_id
            clientSecret  = var.dex_google_client_secret
            redirectURI   = "https://${local.dex_hostname}/callback"
            hostedDomains = [var.dex_google_workspace_domain]
          }
        }
      ]
    }

    ingress = {
      enabled   = true
      className = "alb"
      annotations = {
        "alb.ingress.kubernetes.io/scheme"           = "internet-facing"
        "alb.ingress.kubernetes.io/target-type"      = "ip"
        "alb.ingress.kubernetes.io/certificate-arn"  = local.ingress_certificate_arn
        "alb.ingress.kubernetes.io/listen-ports"     = "[{\"HTTP\":80},{\"HTTPS\":443}]"
        "alb.ingress.kubernetes.io/ssl-redirect"     = "443"
        "alb.ingress.kubernetes.io/backend-protocol" = "HTTP"
      }
      hosts = [
        {
          host = local.dex_hostname
          paths = [
            {
              path     = "/"
              pathType = "Prefix"
            }
          ]
        }
      ]
    }
  })]
}
