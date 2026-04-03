# Google OAuth 2.0 Client ID, from: https://console.cloud.google.com/auth/clients
#
# See: [README.md](./README.md#setting-up-google-oauth-client-for-sso)
# for instructions on setting this up in a new cluster.
dex_google_client_id = "254945981659-9p8ctpobals7gmah0ptlt70t29eflira.apps.googleusercontent.com"

# Optional bootstrap value. If set, tofu uploads to AWS Secrets Manager as:
# k8s/tofu/codeai-k8s/dex_google_client_secret
# Dex reads it from there during the same apply.
# dex_google_client_secret = "replace-me"

# Optional bootstrap values for AWS Secrets Manager to write to:
# k8s/tofu/codeai-k8s/kargo/gitops_repo_{username,password}
# user + PAT must have write access to k8s-gitops repo, see README.md.
# kargo_k8s_gitops_repo_username = "deploy-code-org"
# kargo_k8s_gitops_repo_password = "<PAT for github deploy-code-org>"

# Optional bootstrap value for AWS Secrets Manager to write to:
# k8s/tofu/codeai-k8s/kargo/github_org_webhook_secret
# set this to a random string (for example: `openssl rand -hex 32`), see README.md.
# kargo_github_org_webhook_secret = "<random webhook secret>"
