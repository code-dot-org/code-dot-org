# Optional bootstrap value. If set, tofu uploads to AWS Secrets Manager as:
# k8s/tofu/codeai-k8s/dex_google_client_secret
# Dex reads it from there during the same apply.
# dex_google_client_secret = "replace-me"

# Optional bootstrap value for AWS Secrets Manager to write to:
# k8s/tofu/codeai-k8s/kargo/github_org_webhook_secret
# set this to a random string (for example: `openssl rand -hex 32`), see README.md.
# kargo_github_org_webhook_secret = "<random webhook secret>"

# Optional bootstrap values for AWS Secrets Manager to write to:
# k8s/tofu/codeai-k8s/kargo/gitops_repo_{username,password}
# user + PAT must have write access to k8s-gitops repo, see README.md.
# kargo_k8s_gitops_repo_username = "deploy-code-org"
# kargo_k8s_gitops_repo_password = "<PAT for github deploy-code-org>"
