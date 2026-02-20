#
# Cookbook Name:: cdo-otel-collector
# Recipe:: default
#
# Installs and configures New Relic NRDOT Collector

# Get license key from secrets - fail if not provided
license_key = node['cdo-otel-collector']['license_key']

raise 'New Relic License Key must be provided via node[\'cdo-otel-collector\'][\'license_key\']' unless license_key

# Set up package variables
collector_distro = node['cdo-otel-collector']['distribution']
collector_version = node['cdo-otel-collector']['version']
collector_arch = node['cdo-otel-collector']['architecture']

# Download New Relic NRDOT collector DEB package
collector_package_path = "#{Chef::Config[:file_cache_path]}/nrdot-collector.deb"

remote_file collector_package_path do
  source "https://github.com/newrelic/nrdot-collector-releases/releases/download/#{collector_version}/#{collector_distro}_#{collector_version}_linux_#{collector_arch}.deb"
  mode '0644'
  action :create_if_missing
  notifies :run, 'dpkg_package[nrdot-collector]', :immediately
end

# Install the New Relic NRDOT collector package
dpkg_package 'nrdot-collector' do
  source collector_package_path
  action :nothing
end

# Create environment configuration file with license key
file "/etc/#{collector_distro}/#{collector_distro}.conf" do
  content "NEW_RELIC_LICENSE_KEY=#{license_key}\n"
  mode '0600'
  owner 'root'
  group 'root'
  action :create
  notifies :restart, "service[#{collector_distro}]", :delayed
end

# Manage the New Relic NRDOT collector service
service collector_distro do
  action [:enable, :start]
  supports restart: true, status: true
end

# Verify the installation was successful
script 'verify_nrdot_installation' do
  action :run
  interpreter 'bash'
  code <<-EOH
    # Wait for the collector to start up
    sleep 10

    # Check if the collector is running using health check endpoint
    if curl -s localhost:13133 | grep -q "Server available"; then
      echo "New Relic NRDOT Collector installed and running successfully"
    else
      echo "Warning: New Relic NRDOT collector health check failed"
      exit 1
    fi
  EOH
  only_if {File.exist?("/usr/bin/#{collector_distro}")}
end
