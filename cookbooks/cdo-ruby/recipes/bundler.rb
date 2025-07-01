# git is required for using git repos with bundler
include_recipe 'apt'
apt_package 'git'

# In preparation for no longer running `bundle install` as root, re-own the
# existing root-owned .bundle directories on our persisitent managed servers.
#
# TODO infra: remove this block once we've updated all servers
root_dir = File.join(node[:home], node.chef_environment)
['dashboard', 'cookbooks'].each do |subdir|
  execute "change ownership of #{subdir} bundle directory" do
    command "chown -R #{node[:user]}:#{node[:user]} #{File.join(root_dir, subdir, '.bundle')}"
    user 'root'
  end
end

gem_package 'bundler' do
  action :upgrade
  version node['cdo-ruby']['bundler_version']
end

template "#{node[:home]}/.gemrc" do
  source 'gemrc.erb'
  user node[:user]
  group node[:user]
end
