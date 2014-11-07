#
# Cookbook Name:: cdo-github-access
# Recipe:: default
#

apt_package 'git'

cookbook_file "/home/#{node[:current_user]}/.gitconfig" do
  source 'gitconfig'
  mode '644'
  user node[:current_user]
  group node[:current_user]
end

directory "/home/#{node[:current_user]}/.ssh" do
  mode '0700'
  user node[:current_user]
  group node[:current_user]
end

[
  'config',
  'id_rsa',
  'id_rsa.pub',
].each do |file|
  template "/home/#{node[:current_user]}/.ssh/#{file}" do
    source 'file.erb'
    mode '0600'
    user node[:current_user]
    group node[:current_user]
    variables ({data:node['cdo-github-access'][file]})
  end
end

