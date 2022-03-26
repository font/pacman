{* Expand the name of the chart. *}
{{- define "pacman.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}


{* Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name. *}
{{- define "pacman.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{* Create chart name and version as used by the chart label. *}
{{- define "pacman.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{* Common labels *}
{{- define "pacman.labels" -}}
helm.sh/chart: {{ include "pacman.chart" . }}
{{ include "pacman.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{* Selector labels *}
{{- define "pacman.selectorLabels" -}}
app.kubernetes.io/name: {{ include "pacman.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{* Return ingress class name annotation *}
{{- define "ingressClassAnnotation" -}}
{{- if .Values.ingress.class -}}
kubernetes.io/ingress.class: {{ .Values.ingress.class | quote }}
{{- end -}}
{{- end -}}

{* Create the name of the service account to use *}
{{- define "pacman.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "pacman.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{* Return kubernetes version *}
{{- define "app.kubeVersion" -}}
  {{- default .Capabilities.KubeVersion.Version (regexFind "v[0-9]+\\.[0-9]+\\.[0-9]+" .Capabilities.KubeVersion.Version) -}}
{{- end -}}

{* Return the appropriate apiVersion for ingress. *}
{{- define "ingress.apiVersion" -}}
  {{- if and (.Capabilities.APIVersions.Has "networking.k8s.io/v1") (semverCompare ">= 1.19.x" (include "app.kubeVersion" .)) -}}
      {{- print "networking.k8s.io/v1" -}}
  {{- else if .Capabilities.APIVersions.Has "extensions/v1beta1" -}}
    {{- print "extensions/v1beta1" -}}
  {{- else -}}
    {{- print "networking.k8s.io/v1beta1" -}}
  {{- end -}}
{{- end -}}

{* Determine the proper way of dealing with PSP (deprecated in 1.21+), and migrate to PSA (introduced in beta 1.23) *}
{{- define "psp.isDeprecated" -}}
  {{- if and (.Capabilities.APIVersions.Has "policy/v1beta1") (semverCompare ">= 1.22.x" (include "app.kubeVersion" .)) -}}
    {* FIXME: Find a better way to deal with deprecation here *}
    {{- print "policy/v1beta" -}}
  {{- else -}}
    {{- print "policy/v1beta" -}}
  {{- end -}}
{{- end -}}

{* Is ingress part of stable APIVersion. *}
{{- define "ingress.isStable" -}}
  {{- eq (include "ingress.apiVersion" .) "networking.k8s.io/v1" -}}
{{- end -}}

{* Check if either Ingress or Route is enabled, but not both.
Also build the urlPath *}
{{- define "app.urlPath" -}}
    {{- if and .Values.ingress.create .Values.route.create -}}
        {{  fail "Either enable ingress or route"}}
    {{- end -}}
    {{- if .Values.ingress.create -}}
        {{ if .Values.ingress.path }}
            {{- print .Values.ingress.path -}}
        {{ else }}
            {{- print "" -}}
        {{- end -}}
    {{- else if .Values.route.create -}}
        {{ if .Values.route.path }}
            {{- print .Values.route.path -}}
         {{ else }}
            {{- print "" -}}
        {{- end -}}
     {{ else }}
        {{- print "" -}}
    {{- end -}}
{{- end -}}

{* Build pacman image string *}
{{- define "pacman.imageUrl" -}}
  {{- if .Values.pacman.image.registry }}
    {{- if .Values.pacman.image.repository }}
      {{- if .Values.pacman.image.image }}
        {{- if .Values.pacman.image.tag }}
          {{- printf "%s/%s/%s:%s" .Values.pacman.image.registry .Values.pacman.image.repository .Values.pacman.image.image .Values.pacman.image.tag }}
        {{- end }}
      {{- else }}
        {{- printf "%s/%s/%s" .Values.pacman.image.registry .Values.pacman.image.repository .Values.pacman.image.image }}
      {{- end }}
    {{- else }}
    {{- end }}
  {{- else }}
  {{- end }}
{{- end -}}