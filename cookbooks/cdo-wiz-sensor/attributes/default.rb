default['cdo-wiz-sensor'] = {
  # Off by default. Turn on per environment (adhoc first, then staging/test, then production).
  # When switched back to false the service is stopped and disabled but the package is left installed.
  'enabled' => false,

  # Wiz's installer script. It adds Wiz's GPG-signed APT repository and installs the wiz-sensor package.
  # The script is checked against the SHA256 that Wiz publishes next to it before it runs.
  'install_script_url' => 'https://downloads.wiz.io/sensor/sensor_install.sh',

  # When false (the default) the sensor only detects and reports. It will not kill processes or take
  # other response actions on the host. Leave false until detections have been tuned.
  'allow_runtime_response' => false,

  # Each sensor waits a random 0..N seconds before starting, so a scale-out of many frontends at once
  # does not hit Wiz all at the same moment.
  'start_delay_range_secs' => 60,
}
