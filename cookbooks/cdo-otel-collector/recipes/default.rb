#
# Cookbook Name:: cdo-otel-collector
# Recipe:: default
#

include_recipe 'apt'

# Create otel user and group
group node['cdo-otel-collector']['group'] do
  action :create
  system true
end

user node['cdo-otel-collector']['user'] do
  group node['cdo-otel-collector']['group']
  home node['cdo-otel-collector']['home_dir']
  shell '/bin/false'
  system true
  manage_home true
  action :create
end

# Create configuration directory
directory node['cdo-otel-collector']['config_dir'] do
  owner 'root'
  group node['cdo-otel-collector']['group']
  mode '0750'
  recursive true
end

# Download and install OpenTelemetry Collector
ark 'otelcol' do
  url "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v#{node['cdo-otel-collector']['version']}/otelcol_#{node['cdo-otel-collector']['version']}_linux_amd64.tar.gz"
  version node['cdo-otel-collector']['version']
  path '/opt'
  owner 'root'
  group 'root'
  action :install
end

# Create symlink to binary
link node['cdo-otel-collector']['binary_path'] do
  to "/opt/otelcol-#{node['cdo-otel-collector']['version']}/otelcol"
end

# Generate configuration file
template node['cdo-otel-collector']['config_file'] do
  source 'otel-collector-config.yaml.erb'
  owner 'root'
  group node['cdo-otel-collector']['group']
  mode '0640'
  variables(
    config: node['cdo-otel-collector'],
    environment: node.chef_environment
  )
  notifies :restart, 'service[otel-collector]', :delayed
end

# Validate the configuration
script 'otel-collector-config-validation' do
  action :run
  interpreter 'bash'

  code <<-EOH
    #{node['cdo-otel-collector']['binary_path']} --config=#{node['cdo-otel-collector']['config_file']} --dry-run
    exit $?
  EOH
end

# Generate systemd service file
template '/lib/systemd/system/otel-collector.service' do
  source 'otel-collector.service.erb'
  owner 'root'
  group 'root'
  mode '0644'
  variables(
    config: node['cdo-otel-collector']
  )
  notifies :run, 'execute[systemctl daemon-reload]', :immediately
  notifies :restart, 'service[otel-collector]', :delayed
end

execute 'systemctl daemon-reload' do
  command 'systemctl daemon-reload'
  action :nothing
end

# Enable and start the service
service 'otel-collector' do
  supports restart: true, reload: true, status: true
  action [:enable, :start]
  provider Chef::Provider::Service::Systemd
end
