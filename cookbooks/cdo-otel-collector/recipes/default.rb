#
# Cookbook Name:: cdo-otel-collector
#
# Installs and configures the OpenTelemetry Contrib Collector
# See: https://opentelemetry.io/docs/collector/installation/

unless node['cdo-otel-collector']['enabled']
  # Disable and stop the service if the collector is installed.
  # The binary is intentionally left in place so that re-enabling
  # (setting 'enabled' back to true) only needs to restart the service and
  # re-apply config — it does not require reinstalling the collector.
  service 'otelcol-contrib' do
    action [:disable, :stop]
    supports status: true
    only_if {File.exist?('/usr/bin/otelcol-contrib')}
  end

  # Skip all installation and configuration steps when disabled.
  # If re-enabled later, Chef will converge the full recipe on the next run:
  # the install package is guarded by not_if, so it won't re-run, but all
  # config templates will be re-applied and the service will be re-enabled.
  return
end

apm_backend = node['cdo-otel-collector']['apm_backend']

# Fetch the APM backend's credential from AWS Secrets Manager. The secret name follows
# the standard <env>/cdo/<service>_<credential> convention.
apm_api_key = case apm_backend
              when 'newrelic'
                secret(name: "#{node.chef_environment}/cdo/newrelic_api_key", service: :aws_secrets_manager, version: 'AWSCURRENT')
              when 'sentry'
                secret(name: "#{node.chef_environment}/cdo/sentry_auth_token", service: :aws_secrets_manager, version: 'AWSCURRENT')
              else # datadog
                secret(name: "#{node.chef_environment}/cdo/datadog_api_key", service: :aws_secrets_manager, version: 'AWSCURRENT')
              end

otelcol_version = node['cdo-otel-collector']['otelcol_version']
deb_filename = "otelcol-contrib_#{otelcol_version}_linux_amd64.deb"
deb_path = "#{Chef::Config[:file_cache_path]}/#{deb_filename}"

# Download the OTel Contrib .deb package from the official GitHub release,
# verifying the SHA256 checksum published in the release's checksums.txt.
remote_file deb_path do
  source "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v#{otelcol_version}/#{deb_filename}"
  checksum node['cdo-otel-collector']['otelcol_deb_sha256']
  mode '0644'
  action :create
end

# Install via dpkg
dpkg_package 'otelcol-contrib' do
  source deb_path
  version otelcol_version
  action :install
end

# Ensure the otelcol-contrib configuration directory exists
directory '/etc/otelcol-contrib' do
  owner 'otelcol-contrib'
  group 'otelcol-contrib'
  mode '0755'
  action :create
end

# Configure the OpenTelemetry Collector
template '/etc/otelcol-contrib/config.yaml' do
  source 'otel-config.yaml.erb'
  owner 'otelcol-contrib'
  group 'otelcol-contrib'
  mode '0600'
  variables({
              apm_backend: apm_backend,
              apm_api_key: apm_api_key,
              datadog_site: node['cdo-otel-collector']['datadog_site'],
              newrelic_otlp_endpoint: node['cdo-otel-collector']['newrelic_otlp_endpoint'],
              sentry_otlp_endpoint: node['cdo-otel-collector']['sentry_otlp_endpoint'],
              prometheus_remote_write_url: node['cdo-otel-collector']['prometheus_remote_write_url'],
              prometheus_region: node['cdo-otel-collector']['prometheus_region'],
              apm_trace_sample_rate: node['cdo-otel-collector']['apm_trace_sample_rate']
            }
)
  notifies :restart, 'service[otelcol-contrib]', :delayed
end

# Add an rsyslog forwarding rule so rsyslog pipes syslog to the OTel syslog receiver.
# Numbered 51 so it loads after cdo-syslog's 50-default.conf file-output rule.
# The rsyslog service is declared with action :nothing so the notify works whether or
# not cdo-syslog is also in the run list. If cdo-syslog is present its service resource
# wins; if not, this one handles the restart.
template '/etc/rsyslog.d/51-otelcol.conf' do
  source 'rsyslog-otelcol.conf.erb'
  owner 'root'
  group 'root'
  mode '0644'
  notifies :restart, 'service[rsyslog]', :delayed
end

service 'rsyslog' do
  action :nothing
  supports restart: true, status: true
end

# Manage the otelcol-contrib service
service 'otelcol-contrib' do
  action [:enable, :start]
  supports restart: true, status: true
end
