include_recipe 'cdo-repository'
include_recipe 'cdo-secrets'
include_recipe 'cdo-postfix'
include_recipe 'cdo-varnish'

cores = node['cpu']['total']
env = node.chef_environment
root = "/home/#{node[:current_user]}/#{env}"
rack_envs = [:development, :production, :adhoc, :staging, :test, :levelbuilder, :integration]
without = rack_envs - [env.to_sym]

require 'etc'
user = Etc.getpwuid(::File.stat(root).uid).name rescue node[:current_user]

directory("#{root}/.bundle") { user user }

file "#{root}/.bundle/config" do
  user user
  group user
  content <<BUNDLE
---
BUNDLE_JOBS: #{cores}
BUNDLE_WITHOUT: #{without.join(':')}
BUNDLE_WITH: #{env}
BUNDLE
end

execute 'bundle-install' do
  command 'bundle install'
  cwd root
  user node[:current_user]
  group node[:current_user]
  not_if 'bundle check', cwd: root
end

