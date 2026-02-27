#
# Cookbook Name:: cdo-otel-collector
#
# Installs and configures DataDog OpenTelemetry Collector
# See: https://docs.datadoghq.com/opentelemetry/setup/ddot_collector/

# Download and cache the installation script
install_script_path = "#{Chef::Config[:file_cache_path]}/datadog_install_script.sh"

# Fetches the DataDog API Key via AWS Secrets manager
datadog_api_key = secret(name: "#{node.chef_environment}/cdo/datadog_api_key", service: :aws_secrets_manager, version: 'AWSCURRENT')

remote_file install_script_path do
  source 'https://install.datadoghq.com/scripts/install_script_agent7.sh'
  mode '0755'
  action :create_if_missing
end

# Execute the DataDog installation script with proper environment variables
script 'install_datadog_agent_with_otel' do
  action :run
  interpreter 'bash'
  cwd Chef::Config[:file_cache_path]
  environment(
    'DD_SITE' => node['cdo-otel-collector']['site'],
    'DD_OTELCOLLECTOR_ENABLED' => 'true',
    'DD_AGENT_MAJOR_VERSION' => '7',
    'DD_AGENT_MINOR_VERSION' => '75.0-1',
    'DD_API_KEY' => datadog_api_key
  )
  code <<-EOH
    bash #{install_script_path}
  EOH

  # Only run if datadog-agent is not already installed
  not_if {File.exist?('/usr/bin/datadog-agent')}
end

# Ensure the datadog-agent configuration directory exists
directory '/etc/datadog-agent' do
  owner 'dd-agent'
  group 'dd-agent'
  mode '0755'
  action :create
end

# Configure datadog.yaml with OpenTelemetry Collector enabled
template '/etc/datadog-agent/datadog.yaml' do
  source 'datadog.yaml.erb'
  owner 'dd-agent'
  group 'dd-agent'
  mode '0600'
  variables({
              site: node['cdo-otel-collector']['site'],
              datadog_api_key: datadog_api_key
            }
)
  notifies :restart, 'service[datadog-agent]', :delayed
end

# Configure OpenTelemetry Collector configuration
template '/etc/datadog-agent/otel-config.yaml' do
  source 'otel-config.yaml.erb'
  owner 'dd-agent'
  group 'dd-agent'
  mode '0600'
  variables({
              site: node['cdo-otel-collector']['site'],
              datadog_api_key: datadog_api_key
            }
)
  notifies :restart, 'service[datadog-agent]', :delayed
end

# Manage the DataDog agent service
service 'datadog-agent' do
  action [:enable, :start]
  supports restart: true, status: true
end

# Verify the installation was successful
script 'verify_datadog_installation' do
  action :run
  interpreter 'bash'
  code <<-EOH
    # Wait for the agent to start up
    sleep 10

    # Check if the agent is running and OTel collector is enabled
    /usr/bin/datadog-agent status | grep -q "OTel Agent"
    if [ $? -eq 0 ]; then
      echo "DataDog OpenTelemetry Collector installed and running successfully"
    else
      echo "Warning: DataDog agent is installed but OTel collector status unclear"
      exit 1
    fi
  EOH

  # Only run verification after installation
  only_if {File.exist?('/usr/bin/datadog-agent')}
end
