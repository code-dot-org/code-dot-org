# `rake build` execute resource.
# Triggered when cdo-repository is updated.
user = node[:user]
home = node[:home]
root = File.join home, node.chef_environment
utf8 = 'en_US.UTF-8'
env = {
  'LC_ALL' => utf8,
  'LANGUAGE' => utf8,
  'LANG' => utf8,
  'RAILS_ENV' => node.chef_environment
}
execute 'build-cdo' do
  command 'bundle exec rake build --trace'
  cwd root
  environment env.merge(node['cdo-apps']['bundle_env'], {HOME: "/home/#{user}"})
  live_stream true
  user user
  group user
  action :nothing

  # Rebuild when Ruby is upgraded.
  subscribes :run, "apt_package[ruby#{node['cdo-ruby']['version']}]", :delayed if node['cdo-ruby']
end
