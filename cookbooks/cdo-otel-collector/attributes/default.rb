default['cdo-otel-collector'] = {
  # Set to false to disable the OTel Collector and stop/disable all related services.
  'enabled' => false,
  # DataDog site for the exporter (US1 is optimized for AWS operations).
  'site' => 'datadoghq.com',
  # OTel Contrib collector version to install.
  # When upgrading, update otelcol_deb_sha256 to match the new release's checksums.txt.
  'otelcol_version' => '0.147.0',
  # SHA256 of otelcol-contrib_{version}_linux_amd64.deb from the release's checksums.txt.
  'otelcol_deb_sha256' => 'c4683a3149632a867a257c02187ec88080892ea5e18d4c930a0540ed1db31518'
}
