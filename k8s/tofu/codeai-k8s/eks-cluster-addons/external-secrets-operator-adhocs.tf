#============================================================
# ESO: ClusterSecretStore for adhocs (adhoc-* namespaces)
#
# Adhocs are one-click helm chart installs into dynamically-created
# adhoc-* namespaces. Rather than a per-env SecretStore, adhocs share
# a single ClusterSecretStore restricted to adhoc-* namespaces via
# namespaceRegexes.
#
# The IRSA role is bound to a dedicated SA in the external-secrets
# namespace (where the ESO operator runs), scoped to adhoc/cdo/* secrets.
#============================================================

locals {
  oidc_host = replace(local.cluster_oidc_issuer_url, "https://", "")
}

data "aws_iam_policy_document" "eso_adhocs_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.oidc_host}:sub"
      values   = ["system:serviceaccount:external-secrets:eso-adhocs-sa"]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.oidc_host}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "eso_adhocs_secrets" {
  statement {
    effect  = "Allow"
    actions = ["secretsmanager:GetSecretValue"]

    resources = [
      "arn:aws:secretsmanager:${var.region}:${data.aws_caller_identity.current.account_id}:secret:adhoc/cdo/*",
    ]

    condition {
      test     = "StringEquals"
      variable = "secretsmanager:VersionStage"
      values   = ["AWSCURRENT"]
    }
  }
}

resource "aws_iam_role" "eso_adhocs" {
  name               = "codeai-k8s-eso-adhocs"
  assume_role_policy = data.aws_iam_policy_document.eso_adhocs_trust.json
}

resource "aws_iam_role_policy" "eso_adhocs_secrets" {
  name   = "secrets-manager-access"
  role   = aws_iam_role.eso_adhocs.id
  policy = data.aws_iam_policy_document.eso_adhocs_secrets.json
}

resource "kubernetes_service_account_v1" "eso_adhocs" {
  metadata {
    name      = "eso-adhocs-sa"
    namespace = "external-secrets"

    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.eso_adhocs.arn
    }
  }

  depends_on = [helm_release.external_secrets]
}

resource "kubernetes_manifest" "eso_adhocs_cluster_secret_store" {
  manifest = {
    apiVersion = "external-secrets.io/v1"
    kind       = "ClusterSecretStore"
    metadata = {
      name = "adhocs-aws-secrets-manager"
    }
    spec = {
      conditions = [
        {
          namespaceRegexes = ["^adhoc-.*"]
        }
      ]
      provider = {
        aws = {
          service = "SecretsManager"
          region  = var.region
          auth = {
            jwt = {
              serviceAccountRef = {
                name      = kubernetes_service_account_v1.eso_adhocs.metadata[0].name
                namespace = "external-secrets"
              }
            }
          }
        }
      }
    }
  }

  depends_on = [kubernetes_service_account_v1.eso_adhocs]
}
