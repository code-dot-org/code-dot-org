#============================================================
# Install Gateway API CRDs so add-ons can create Gateway API resources later.
#
# Upstream and AWS document these as raw manifest installs, so fetch and apply
# the manifest URLs directly instead of wrapping them in a local Helm chart.
#============================================================

locals {
  # Align with aws_load_balancer_controller_chart_version in:
  # ./helm.tf
  gateway_api_version = "v1.5.0"
}

data "http" "gateway_api_standard_crds" {
  url = "https://github.com/kubernetes-sigs/gateway-api/releases/download/${local.gateway_api_version}/standard-install.yaml"
}

data "kubectl_file_documents" "gateway_api_crds" {
  content = data.http.gateway_api_standard_crds.response_body
}

resource "kubectl_manifest" "gateway_api_crds" {
  for_each = data.kubectl_file_documents.gateway_api_crds.manifests

  # Redact the giant CRD YAML in OpenTofu plan/apply output.
  yaml_body = sensitive(each.value)

  # yaml_body_parsed is still shown in plan output, so hide the bulky CRD body too.
  sensitive_fields = ["metadata", "spec", "status"]

  server_side_apply = true
  field_manager     = "terraform"
}
