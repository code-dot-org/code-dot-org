#
# Cookbook Name:: cdo-wiz-sensor
# Recipe:: default
#
# Installs the Wiz Runtime Sensor, an eBPF agent that reports suspicious process, file and network
# activity on the host to Wiz. See README.md for setup and rollout.
# Wiz docs: https://docs.wiz.io/docs/sensor-install-linux

require 'digest'
require 'json'

unless node['cdo-wiz-sensor']['enabled']
  service 'wiz-sensor' do
    action [:disable, :stop]
    only_if {File.exist?('/opt/wiz/sensor')}
  end
  return
end

# Frontends boot from an AMI that is built by a short-lived instance named ami-<instance-id>
# (see aws/cloudformation/cloud_formation_stack.yml.erb). On that builder we install the sensor without
# starting it, so the sensor registers for the first time on each frontend that boots from the image,
# not once on the builder.
baking_ami = node.name.start_with?('ami-')

client_id = secret(name: "#{node.chef_environment}/cdo/wiz_sensor_client_id", service: :aws_secrets_manager, version: 'AWSCURRENT')
client_secret = secret(name: "#{node.chef_environment}/cdo/wiz_sensor_client_secret", service: :aws_secrets_manager, version: 'AWSCURRENT')

sensor_env = {
  'WIZ_API_CLIENT_ID' => client_id,
  'WIZ_API_CLIENT_SECRET' => client_secret,
  # Install the package and write its config, but let Chef decide when the service starts.
  'WIZ_INSTALL_ONLY' => '1',
  'WIZ_SENSOR_START_DELAY_RANGE' => node['cdo-wiz-sensor']['start_delay_range_secs'].to_s,
  'WIZ_RESOURCE_TAGS' => {env: node.chef_environment}.to_json,
}
sensor_env['WIZ_DISALLOW_RUNTIME_RESPONSE'] = 'true' unless node['cdo-wiz-sensor']['allow_runtime_response']

# Wiz only reads these settings at install time, so any change means running the installer again.
# We record a digest of the settings and rerun the installer when it changes.
config_digest = Digest::SHA256.hexdigest(sensor_env.sort.to_json)
digest_file = '/opt/wiz/.cdo-config-digest'
script_url = node['cdo-wiz-sensor']['install_script_url']
script_path = "#{Chef::Config[:file_cache_path]}/wiz_sensor_install.sh"

execute 'install wiz-sensor' do
  command <<~BASH
    set -euo pipefail
    curl -fsSL -o #{script_path} #{script_url}
    expected=$(curl -fsSL #{script_url}.sha256 | awk '{print $1}')
    echo "${expected}  #{script_path}" | sha256sum -c -
    bash #{script_path}
    echo #{config_digest} > #{digest_file}
    chmod 600 #{digest_file}
  BASH
  # Credentials go in through the environment, not the command line, so they do not show up in ps or logs.
  environment sensor_env
  sensitive true
  not_if {File.exist?(digest_file) && File.read(digest_file).strip == config_digest}
  notifies :restart, 'service[wiz-sensor]', :delayed unless baking_ami
end

service 'wiz-sensor' do
  supports restart: true, status: true
  action baking_ami ? [:enable] : [:enable, :start]
end
