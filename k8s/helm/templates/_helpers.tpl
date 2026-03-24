{{- define "cdo.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified component name.
If release name contains chart name it will be used as a full name.
Usage:
{{ include "cdo.fullname" (merge (dict "component" "mysql") .) }}
*/}}
{{- define "cdo.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- printf "%s-%s" .Values.fullnameOverride .component | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- printf "%s-%s" .Release.Name .component | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s-%s" .Release.Name $name .component | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "cdo.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Metadata labels for chart component
Usage:
{{ include "cdo.labels" (merge (dict "component" "mysql") .) }}
*/}}
{{- define "cdo.labels" -}}
helm.sh/chart: {{ include "cdo.chart" . }}
{{ include "cdo.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels for chart component
Usage:
{{ include "cdo.selectorLabels" (merge (dict "component" "mysql") .) }}
*/}}
{{- define "cdo.selectorLabels" -}}
app.kubernetes.io/name: {{ include "cdo.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{- define "cdo.mysqlServiceName" -}}
{{- include "cdo.fullname" (merge (dict "component" "mysql") .) -}}
{{- end }}

{{- define "cdo.redisServiceName" -}}
{{- include "cdo.fullname" (merge (dict "component" "redis") .) -}}
{{- end }}

{{- define "cdo.minioServiceName" -}}
{{- include "cdo.fullname" (merge (dict "component" "minio") .) -}}
{{- end }}

{{/*
Return a decoded value from an existing Secret when present, otherwise use a
provided default or generate a random string.
Usage:
{{ include "cdo.secretValue" (dict "secret" $existing "key" "_redis_password" "randLen" 24) }}
{{ include "cdo.secretValue" (dict "secret" $existing "key" "_minio_root_user" "default" "local-development") }}
*/}}
{{- define "cdo.secretValue" -}}
{{- if and .secret (hasKey .secret.data .key) -}}
{{- index .secret.data .key | b64dec -}}
{{- else if hasKey . "default" -}}
{{- .default -}}
{{- else if and (hasKey . "deterministicValue") .deterministicValue -}}
{{- .deterministicValue -}}
{{- else -}}
{{- randAlphaNum .randLen -}}
{{- end -}}
{{- end }}
