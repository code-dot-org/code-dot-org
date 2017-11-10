include_recipe 'apt'
include_recipe 'cdo-pmm::server'

# Installs and configures PMM client pointing at the target MySQL server.
apt_repository 'percona' do
  uri 'https://repo.percona.com/apt'
  distribution node[:lsb][:codename]
  components ['main']
  key '8507EFA5'
end

apt_package 'pmm-client'

template "/usr/local/percona/pmm-client/pmm.yml" do
  source 'pmm.yml.erb'
  notifies :run, 'execute[pmm-admin]', :immediately
end

# Constructs a sequence of 'pmm-admin' commands to run to configure the PMM client.
# Pass all mysql options to the mysql-add commands as `--name='value'`.
mysql = node['cdo-pmm']['mysql']
commands = {
  'uninstall' => {},
  'add mysql:metrics' => mysql,
  'add mysql:queries' => mysql
}
commands['add linux:metrics'] = {} if node['cdo-pmm']['linux_metrics']
pmm_admin_command = commands.map do |command, opts|
  "pmm-admin #{command} #{opts.map {|name, value| "--#{name}='#{value}'"}.join(' ')}"
end.join(' && ')

execute 'pmm-admin' do
  sensitive true
  command pmm_admin_command
  action :nothing
end
