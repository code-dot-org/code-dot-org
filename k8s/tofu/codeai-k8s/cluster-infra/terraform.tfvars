# Google OAuth 2.0 Client ID, from: https://console.cloud.google.com/auth/clients
#
# See: [README.md](./README.md#setting-up-google-oauth-client-for-sso)
# for instructions on setting this up in a new cluster.
#
# dex_google_client_id = "replace-me (optional)"

# Optional bootstrap value. If set, tofu uploads to AWS Secrets Manager as:
# k8s/tofu/codeai-k8s/dex_google_client_secret
#
# dex_google_client_secret = "replace-me"

# Optional bootstrap values for AWS Secrets Manager to write to:
# k8s/tofu/codeai-k8s/kargo/gitops_repo_{username,password}
# user + PAT must have write access to k8s-gitops repo, see README.md.
#
# kargo_k8s_gitops_repo_username = "deploy-code-org"
# kargo_k8s_gitops_repo_password = "<PAT for github deploy-code-org>"
