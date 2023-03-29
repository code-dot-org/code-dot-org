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
  environment env.merge(node['cdo-apps']['bundle_env'])
  live_stream true
  user user
  group user
  action :nothing

  # Rebuild when Ruby is upgraded.
  subscribes :run, "apt_package[ruby#{node['cdo-ruby']['version']}]", :delayed if node['cdo-ruby']
end

# Clean up build artifacts left over on persistent servers after building.
execute 'clean-build-artifacts' do
  # Currently, this only removes the build artifacts for the `karma-webpack`
  # NPM package because they've been accumulating on the test server and eating
  # up our storage space. This could be expanded in the future to include any
  # other cleanup we might discover we need.
  command 'rm -r /tmp/_karma_webpack_*'

  # We don't need to run this every time, just after a build.
  action :nothing
  subscribes :run, 'execute[build-cdo]'
end
