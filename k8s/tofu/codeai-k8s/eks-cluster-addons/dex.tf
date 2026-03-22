#============================================================
# Install Dex for cluster-wide OIDC login
#============================================================

locals {
  google_groups_admin_email           = data.terraform_remote_state.codeai_k8s_dex.outputs.google_email_with_groups_readonly_scope
  google_workspace_domains            = data.terraform_remote_state.codeai_k8s_dex.outputs.google_workspace_domains
  dex_google_service_account_key_json = data.terraform_remote_state.codeai_k8s_dex.outputs.google_service_account_key_json
  dex_google_redirect_url             = "https://${local.dex_hostname}/callback"

  # Kubernetes write-only secret fields need a separate revision trigger to update on key rotation.
  dex_google_service_account_key_revision = parseint(substr(md5(local.dex_google_service_account_key_json), 0, 8), 16)
}

resource "kubernetes_manifest" "dex_namespace" {
  manifest = {
    apiVersion = "v1"
    kind       = "Namespace"
    metadata = {
      name = "dex"
    }
  }
}

resource "kubernetes_secret_v1" "dex_google_service_account" {
  metadata {
    name      = "dex-google-service-account"
    namespace = "dex"
  }

  data_wo = {
    "codeai-k8s-dex.json" = local.dex_google_service_account_key_json
  }
  data_wo_revision = local.dex_google_service_account_key_revision

  type = "Opaque"

  depends_on = [kubernetes_manifest.dex_namespace]
}

resource "helm_release" "dex" {
  name       = "dex"
  repository = "https://charts.dexidp.io"
  chart      = "dex"
  version    = "0.24.0"
  namespace  = "dex"

  values = [yamlencode({
    config = {
      issuer = "https://${local.dex_hostname}"

      web = {
        # Kargo performs OIDC discovery and token exchange from the browser
        # against Dex, so Dex must allow the Kargo UI origin for CORS.
        allowedOrigins = ["https://${local.kargo_hostname}"]
      }

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
        },
        {
          id           = local.kargo_hostname
          name         = "Kargo"
          public       = true
          redirectURIs = ["https://${local.kargo_hostname}/login"]
        },
        {
          id           = "${local.kargo_hostname}-cli"
          name         = "Kargo CLI"
          public       = true
          redirectURIs = ["http://localhost/auth/callback"]
        }
      ]

      connectors = [
        {
          type = "google"
          id   = "google"
          name = "Google"
          config = {
            clientID               = var.dex_google_client_id
            clientSecret           = local.dex_google_client_secret
            redirectURI            = local.dex_google_redirect_url
            hostedDomains          = local.google_workspace_domains
            groups                 = ["engineers@code.org", "infrastructure@code.org", "trusted-contributors@code.org", "product@code.org", "all@code.org"]
            serviceAccountFilePath = "/etc/dex/google/codeai-k8s-dex.json"
            domainToAdminEmail = {
              for domain in local.google_workspace_domains :
              domain => local.google_groups_admin_email
            }
          }
        }
      ]
    }

    volumes = [
      {
        name = "google-service-account"
        secret = {
          secretName = "dex-google-service-account"
        }
      }
    ]

    volumeMounts = [
      {
        name      = "google-service-account"
        mountPath = "/etc/dex/google"
        readOnly  = true
      }
    ]

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

  depends_on = [
    kubernetes_manifest.dex_namespace,
    kubernetes_secret_v1.dex_google_service_account,
  ]
}
