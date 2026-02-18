#
# Cookbook Name:: cdo-otel-collector
# Recipe:: default
#

include_recipe 'apt'

# Ensure wget is available for downloading the DEB package
apt_package 'wget' do
  action :install
end

# Download OpenTelemetry Collector DEB package
remote_file "#{Chef::Config[:file_cache_path]}/otelcol_#{node['cdo-otel-collector']['version']}_linux_amd64.deb" do
  source "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v#{node['cdo-otel-collector']['version']}/otelcol_#{node['cdo-otel-collector']['version']}_linux_amd64.deb"
  mode '0644'
  action :create
  not_if "dpkg -l | grep -q '^ii  otelcol '"
end

# Install OpenTelemetry Collector DEB package
dpkg_package 'otelcol' do
  source "#{Chef::Config[:file_cache_path]}/otelcol_#{node['cdo-otel-collector']['version']}_linux_amd64.deb"
  action :install
  notifies :restart, 'service[otelcol]', :delayed
end

# Generate configuration file (package creates the directory)
template node['cdo-otel-collector']['config_file'] do
  source 'otel-collector-config.yaml.erb'
  owner 'root'
  group 'root'
  mode '0644'
  variables(
    config: node['cdo-otel-collector'],
    environment: node.chef_environment
  )
  notifies :restart, 'service[otelcol]', :delayed
  # Only create template if package is installed
  only_if {File.exist?('/usr/bin/otelcol')}
end

# Validate the configuration
script 'otel-collector-config-validation' do
  action :run
  interpreter 'bash'

  code <<-EOH
    /usr/bin/otelcol --config=#{node['cdo-otel-collector']['config_file']} --dry-run
    exit $?
  EOH
end

# Enable and start the service (service is created by the DEB package)
service 'otelcol' do
  supports restart: true, reload: true, status: true
  action [:enable, :start]
  provider Chef::Provider::Service::Systemd
end
