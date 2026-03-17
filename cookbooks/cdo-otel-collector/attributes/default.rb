default['cdo-otel-collector'] = {
  # Set to false to disable the OTel Collector and stop/disable all related services.
  'enabled' => false,

  # OTel Contrib collector version to install.
  # When upgrading, update otelcol_deb_sha256 to match the new release's checksums.txt.
  'otelcol_version' => '0.147.0',
  # SHA256 of otelcol-contrib_{version}_linux_amd64.deb from the release's checksums.txt.
  'otelcol_deb_sha256' => 'c4683a3149632a867a257c02187ec88080892ea5e18d4c930a0540ed1db31518',

  # Prometheus remote write URL. Leave empty to disable the Prometheus pipeline.
  'prometheus_remote_write_url' => '',
  # AWS region for SigV4 signing of Prometheus remote write requests.
  'prometheus_region' => 'us-east-1',

  # Sampling percentage for APM traces as a float (0.0-100.0). The sampler hashes the trace ID to make
  # a consistent per-trace decision, so all spans within a trace are kept or dropped together.
  # Applied in the main traces pipeline before APM exporters; the spanmetrics pipeline is unaffected
  # so RED metrics remain accurate. Default 100.0 = send all traces.
  'apm_trace_sample_rate' => 100.0,

  # APM backend to forward telemetry to. Supported values:
  #   'datadog'  - DataDog exporter (computes APM stats client-side; applies DD-specific processors).
  #                Requires secret: <env>/cdo/datadog_api_key in AWS Secrets Manager.
  #   'newrelic' - New Relic via standard OTLP/gRPC. No DD-specific processors applied.
  #                Requires secret: <env>/cdo/newrelic_api_key in AWS Secrets Manager.
  #   'sentry'   - Sentry via standard OTLP/HTTP. No DD-specific processors applied.
  #                Requires secret: <env>/cdo/sentry_auth_token in AWS Secrets Manager.
  'apm_backend' => 'datadog',

  # -- Datadog-specific -----------------------------------------------------------------
  # DataDog site for the exporter (US1 is optimized for AWS operations).
  # Find site at https://docs.datadoghq.com/getting_started/site/ under "DD_SITE parameter".
  'datadog_site' => 'datadoghq.com',

  # -- New Relic-specific ---------------------------------------------------------------
  # OTLP/gRPC endpoint for New Relic. Find your regional endpoint in the New Relic UI under
  # Account settings > API keys > OTLP endpoint, or see
  # https://docs.newrelic.com/docs/opentelemetry/best-practices/opentelemetry-otlp/#configure-endpoint-port-protocol
  'newrelic_otlp_endpoint' => 'https://otlp.nr-data.net:4317',

  # -- Sentry-specific ------------------------------------------------------------------
  # OTLP/HTTP endpoint for Sentry. Construct from your project DSN found in Sentry under
  # Settings > Projects > <project> > Client Keys (DSN):
  'sentry_otlp_endpoint' => ''
}
