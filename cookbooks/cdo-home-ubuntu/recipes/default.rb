#
# Cookbook Name:: cdo-home-ubuntu
# Recipe:: default
#

[
  '.bashrc',
  '.inputrc',
  '.profile',
  '.vimrc'
].each do |file|
  template "/home/#{node[:current_user]}/#{file}" do
    source "#{file[1..-1]}.erb"
    mode '0644'
    user node[:current_user]
    group node[:current_user]
  end

  template "/root/#{file}" do
    source "#{file[1..-1]}.erb"
    mode '0644'
    user 'root'
    group 'root'
  end
end
