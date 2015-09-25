#
# Cookbook Name:: cdo-apps
# Recipe:: default
#

# These packages are used by Gems we install via Bundler later.
apt_package 'libxslt1-dev'
apt_package 'libssl-dev'
apt_package 'zlib1g-dev'
apt_package 'imagemagick'
apt_package 'libmagickcore-dev'
apt_package 'libmagickwand-dev'
apt_package 'pdftk'
apt_package 'enscript'

include_recipe 'cdo-apps::dashboard'
include_recipe 'cdo-apps::pegasus'

template "/home/#{node[:current_user]}/#{node.chef_environment}/crontab" do
  source 'crontab.erb'
  user node[:current_user]
  group node[:current_user]
  mode '0644'
  notifies :run, "execute[install-aws-crontab]", :immediately
end

execute "install-aws-crontab" do
  command "cat ./crontab | crontab -"
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}"
  user node[:current_user]
  group node[:current_user]
  action :nothing
end
