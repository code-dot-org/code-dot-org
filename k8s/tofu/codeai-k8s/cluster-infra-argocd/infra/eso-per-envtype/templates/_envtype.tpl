{{- define "eso-per-envtype.render" -}}
{{- if .single_namespace_environment_type }}
apiVersion: v1
kind: Namespace
metadata:
  name: {{ .environment_type }}
---
{{- end }}
apiVersion: v1
kind: ServiceAccount
metadata:
  name: external-secrets-sa-{{ .environment_type }}
  namespace: {{ ternary .environment_type "external-secrets" .single_namespace_environment_type }}
  annotations:
    eks.amazonaws.com/role-arn: {{ .iam_role_arn | quote }}
---
{{- if .single_namespace_environment_type }}
#==============================================================================
# Per-k8s-namespace SecretStore : aws-secrets-manager-store in kubernetes
#
# This is installed in "one namespace per environment type" situations, namely:
# - staging, levelbuilder, test, and production
#==============================================================================
apiVersion: external-secrets.io/v1
kind: SecretStore
metadata:
  name: aws-secrets-manager-store
  namespace: {{ .environment_type }}
spec:
  provider:
    aws:
      service: SecretsManager
      region: {{ .region | quote }}
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa-{{ .environment_type }}
{{- else }}
#==============================================================================
# ClusterSecretStore : aws-secrets-manager-store-${env_type} in kubernetes
#
# This is installed in "multiple namespace per env type" situations, namely:
# - adhoc, where all adhoc-* namespaces will have access to this ClusterSecretStore
#==============================================================================
apiVersion: external-secrets.io/v1
kind: ClusterSecretStore
metadata:
  name: aws-secrets-manager-store-{{ .environment_type }}
spec:
  conditions:
    - namespaceRegexes:
{{ toYaml .multi_namespace_regexes | indent 8 }}
  provider:
    aws:
      service: SecretsManager
      region: {{ .region | quote }}
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa-{{ .environment_type }}
            namespace: external-secrets
{{- end }}
---
{{- if .single_namespace_environment_type }}
#==============================================================================
# Per-k8s-namespace ExternalSecret : cdo-external-secrets in kubernetes
#
# This syncs all secrets like {namespace}/cdo/* from AWS Secrets Manager into a
# single Kubernetes Secret named cdo-external-secrets.
#==============================================================================
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: cdo-external-secrets
  namespace: {{ .environment_type }}
spec:
  refreshInterval: 5m
  secretStoreRef:
    name: aws-secrets-manager-store
    kind: SecretStore
  target:
    creationPolicy: Owner
    deletionPolicy: Retain
    name: cdo-external-secrets
  dataFrom:
    - find:
        conversionStrategy: Default
        decodingStrategy: None
        path: {{ printf "%s/cdo/" .environment_type | quote }}
        name:
          regexp: {{ printf "^%s/cdo/.*$" .environment_type | quote }}
      rewrite:
        - regexp:
            source: {{ printf "^%s/cdo/(.*)$" .environment_type | quote }}
            target: "$1"
{{- else }}
#==============================================================================
# ClusterExternalSecret fanout for multi-namespace env types like adhoc-*
#
# ClusterExternalSecret selects namespaces by label, not by regex. To have all
# adhoc-* namespaces receive this ExternalSecret, label them with:
# code.org/environment-type = adhoc
#==============================================================================
apiVersion: external-secrets.io/v1
kind: ClusterExternalSecret
metadata:
  name: cdo-external-secrets-{{ .environment_type }}
spec:
  externalSecretName: cdo-external-secrets
  namespaceSelectors:
    - matchLabels:
        code.org/environment-type: {{ .environment_type | quote }}
  refreshTime: 1m
  externalSecretSpec:
    refreshInterval: 5m
    secretStoreRef:
      name: aws-secrets-manager-store-{{ .environment_type }}
      kind: ClusterSecretStore
    target:
      creationPolicy: Owner
      deletionPolicy: Retain
      name: cdo-external-secrets
    dataFrom:
      - find:
          conversionStrategy: Default
          decodingStrategy: None
          path: {{ printf "%s/cdo/" .environment_type | quote }}
          name:
            regexp: {{ printf "^%s/cdo/.*$" .environment_type | quote }}
        rewrite:
          - regexp:
              source: {{ printf "^%s/cdo/(.*)$" .environment_type | quote }}
              target: "$1"
{{- end }}
{{- end -}}
