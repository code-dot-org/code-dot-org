data "kubernetes_config_map_v1" "codeai_cluster_config" {
  metadata {
    name      = "codeai-cluster-config"
    namespace = "kube-system"
  }
}
