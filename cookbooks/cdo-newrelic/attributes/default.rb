default['cdo-newrelic'] = {
  # 40-character hexadecimal string provided by New Relic. This is
  # required in order for the server monitor to start.
  'license-key'=>'0000000000000000000000000000000000000000',
  # New Relic REST API key, required to modify server alert policies on startup/shutdown.
  'api-key'=>nil,
  # Enabled alert policy to assign to the instance on startup.
  'enabled_alert_policy_id' => 368270,
  # Disabled alert policy to assign to the instance on shutdown.
  'disabled_alert_policy_id' => 355700
}
