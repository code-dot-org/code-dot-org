#
# Cookbook Name:: cdo-github-access
# Recipe:: default
#

apt_package 'git'

cookbook_file "/home/#{node[:current_user]}/.gitconfig" do
  source 'gitconfig'
  mode '644'
end

directory "/home/#{node[:current_user]}/.ssh" do
  mode '0700'
end

[
  'config',
  'id_rsa',
  'id_rsa.pub',
].each do |file|
  template "/home/#{node[:current_user]}/.ssh/#{file}" do
    source 'file.erb'
    mode '0600'
    variables ({data:node['cdo-github-access'][file]})
  end
end

