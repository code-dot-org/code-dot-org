default['cdo-otel-collector'] = {
  # Set to false to disable DataDog and stop/disable all related services.
  'enabled' => false,
  # US1 is optimized for AWS operations.
  'site' => 'datadoghq.com',
  'logs_enabled' => true
}
