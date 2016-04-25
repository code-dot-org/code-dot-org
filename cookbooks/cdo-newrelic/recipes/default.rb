#
# Cookbook Name:: cdo-newrelic
# Recipe:: default
#

apt_repository 'newrelic' do
  uri 'http://apt.newrelic.com/debian/'
  distribution 'newrelic'
  components ['non-free']
  key 'https://download.newrelic.com/548C16BF.gpg'
end

apt_package 'newrelic-sysmond'

service 'newrelic-sysmond' do
  action [:enable]
end

template '/etc/newrelic/nrsysmond.cfg' do
  source 'nrsysmond.cfg.erb'
  user 'root'
  group 'newrelic'
  mode '640'
  notifies :restart, "service[newrelic-sysmond]", :immediately
end

template '/etc/init.d/cdo-newrelic' do
  source 'newrelic_init.sh.erb'
  user 'root'
  group 'root'
  variables({
    # Allows newrelic.rb to be referenced by the startup/shutdown service hook.
    newrelic_rb: run_context.cookbook_collection['cdo-newrelic'].library_filenames.first,
    env: {
      NEWRELIC_API_KEY: node['cdo-newrelic']['api-key'],
      ENABLED_ALERT_POLICY_ID: node['cdo-newrelic']['enabled_alert_policy_id'],
      DISABLED_ALERT_POLICY_ID: node['cdo-newrelic']['disabled_alert_policy_id']
    }
  })
  mode '0777'
  action :create
  only_if { node['cdo-newrelic']['api-key'] }
  notifies :restart, 'service[cdo-newrelic]'
end

service 'cdo-newrelic' do
  supports restart: true, status: true
  action [:enable, :start]
end
