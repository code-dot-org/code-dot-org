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
