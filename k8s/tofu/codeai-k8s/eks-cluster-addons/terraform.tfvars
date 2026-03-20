# Google OAuth 2.0 Client ID, from: https://console.cloud.google.com/auth/clients
#
# See: [README.md](./README.md#setting-up-google-oauth-client-for-sso)
# for instructions on setting this up in a new cluster.
dex_google_client_id     = "254945981659-9p8ctpobals7gmah0ptlt70t29eflira.apps.googleusercontent.com"

# Optional bootstrap value. If set, tofu uploads to AWS Secrets Manager as:
# k8s/tofu/codeai-k8s/dex_google_client_secret
# Dex reads it from there during the same apply.
# dex_google_client_secret = "replace-me"
