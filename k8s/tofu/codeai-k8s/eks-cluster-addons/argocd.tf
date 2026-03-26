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

    # We use the separate cluster-wide Dex deployment at dex.${local.cluster_subdomain},
    # not the argo-cd chart's bundled Dex server.
    dex = {
      enabled = false
    }

    configs = {
      params = {
        # TLS terminates at the ALB, so argocd-server should speak plain HTTP to the ingress backend:
        "server.insecure" = true

        # Only raise these if repo-server work starts succeeding after we bump
        # ARGOCD_EXEC_TIMEOUT, but the API server or application-controller
        # still give up waiting on repo-server RPCs.
        # "server.repo.server.timeout.seconds"     = "600"
        # "controller.repo.server.timeout.seconds" = "600"
      }

      cm = {
        # BREAK GLASS FOR EMERGENCY ARGOCD ADMIN LOGIN (if google sso has failed):
        # 1. set `"admin.enabled" = true` below
        # 2. tofu apply
        # 3. emergency login to argo cd with:
        #    Username: admin
        #    Password: run `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 --decode; echo`
        #
        # TO CLEANUP AFTER EMERGENCY (sso working again):
        # 1. set `"admin.enabled" = false` below
        # 2. tofu apply
        # 3. run to delete tmp plaintext admin secrets:
        #    `kubectl -n argocd patch secret argocd-secret --type='json' -p='[{"op":"remove","path":"/data/admin.password"},{"op":"remove","path":"/data/admin.passwordMtime"}]' && kubectl -n argocd delete secret argocd-initial-admin-secret --ignore-not-found`

        # admin.enabled=true causes the argocd chart to generate a plaintext password admin login
        # we use Google SSO with google group roles infrastructure@code.org etc mapped to admin
        "admin.enabled" = false

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
            "groups",
          ]
        })
      }

      rbac = {
        "policy.csv" = join("\n", [
          "g, all@code.org, role:readonly",
          "g, trusted-contributors@code.org, role:readonly",
          "g, product@code.org, role:readonly",
          "g, engineers@code.org, role:admin",
          "g, infrastructure@code.org, role:admin",
        ])
      }

      secret = {
        extra = {
          "dex.argocd.clientSecret" = random_password.dex_client_secret_argocd.result
        }
      }
    }

    server = {
      ingress = {
        enabled    = true
        controller = "generic"
        hostname   = local.argocd_hostname
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

    repoServer = {
      extraEnv = [
        {
          name  = "ARGOCD_EXEC_TIMEOUT"
          value = "10m"
        }
      ]

      resources = {
        # TODO: Local concurrent-fetch benchmarking showed that moving from 1 CPU / 4Gi
        # to 2 CPU / 8Gi cut a large code-dot-org fetch by about 3 minutes out of
        # roughly 15 minutes. Consider that bump for full production usage.
        requests = {
          cpu    = "1000m"
          memory = "4Gi"
          # The default Fargate ephemeral storage per pod (20GB) is too small
          # for a single checkout of the code-dot-org repo 🤪
          "ephemeral-storage" = "40Gi"
        }
        limits = {
          cpu                 = "1000m"
          memory              = "4Gi"
          "ephemeral-storage" = "40Gi"
        }
      }
    }
  })]

  set {
    name  = "crds.install"
    value = "true"
  }
}
