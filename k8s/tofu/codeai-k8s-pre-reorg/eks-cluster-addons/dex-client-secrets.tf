resource "random_password" "dex_client_secret_argocd" {
  length  = 32
  special = false
}
