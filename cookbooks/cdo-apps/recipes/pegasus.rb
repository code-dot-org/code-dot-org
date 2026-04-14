# Cookbook Name:: cdo-apps
# Recipe:: pegasus
#
# Teardown: Remove the Pegasus service from instances where it was previously installed by undoing resources provisioned
# by `CdoApps`. Safe to run on instances that never had it (guards ensure no-ops). Once this change has been deployed to
# all long-running instances (staging, test, levelbuilder, production), this recipe and its inclusion in default.rb can
# be deleted.

app_name = 'pegasus'
home = node[:home]
root = File.join(home, node.chef_environment)
app_root = File.join(root, app_name)
unit_file = "/lib/systemd/system/#{app_name}.service"

# Stop and disable the Pegasus service.
service app_name do
  action [:stop, :disable]
  only_if {File.exist?(unit_file)}
end

# Remove the Pegasus unit file and reload systemd.
file unit_file do
  action :delete
  notifies :run, 'execute[systemctl daemon-reload]', :immediately
end

execute 'systemctl daemon-reload' do
  action :nothing
end

# Remove the Pegasus logrotate configuration.
file "/etc/logrotate.d/#{app_name}" do
  action :delete
end

# Remove Chef cache markers that trigger setup/restart.
file "#{Chef::Config[:file_cache_path]}/#{app_name}_setup" do
  action :delete
end

file "#{Chef::Config[:file_cache_path]}/#{app_name}_listeners" do
  action :delete
end

# Remove Pegasus NewRelic configuration, if it exists.
file "#{app_root}/config/newrelic.yml" do
  action :delete
  only_if {File.exist?("#{app_root}/config/newrelic.yml")}
end
