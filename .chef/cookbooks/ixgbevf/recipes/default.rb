#
# Cookbook Name:: ixgbevf
# Recipe:: default
#
# Copyright (C) 2015 Joe Hohertz
#

include_recipe 'ixgbevf::dkms'
include_recipe 'ixgbevf::ifnames_disable' if node['ixgbevf']['disable_ifnames']

remote_file "#{Chef::Config[:file_cache_path]}/#{node['ixgbevf']['package']}" do
  source node['ixgbevf']['package_url']
  checksum node['ixgbevf']['checksum']
  mode 00644
  action :create
end

execute 'extract_ixgbevf_source' do
  command "tar xzvf #{Chef::Config[:file_cache_path]}/#{node['ixgbevf']['package']}"
  cwd '/usr/src'
  not_if { File.exists?( node['ixgbevf']['dir'] ) }
end

template "#{node['ixgbevf']['dir']}/dkms.conf" do
  source "dkms.conf.erb"
  owner "root"
  group "root"
  mode  00644
end

template "/etc/modprobe.d/ixgbevf.conf" do
  source "ixgbevf.conf.erb"
  owner "root"
  group "root"
  mode  00644
end

# FIXME: does this vary by platform?
dkms_dir = '/var/lib/dkms/ixgbevf'

execute 'dkms_add_ixgbevf' do
  command "dkms add -m ixgbevf -v #{node['ixgbevf']['version']}"
  not_if { File.exists?(dkms_dir) }
end

execute 'dkms_build_ixgbevf' do
  command "dkms build -m ixgbevf -v #{node['ixgbevf']['version']}"
  not_if { File.exists?("#{dkms_dir}/#{node['ixgbevf']['version']}/build") }
end

execute 'dkms_install_ixgbevf' do
  command "dkms install -m ixgbevf -v #{node['ixgbevf']['version']}"
  not_if {`modinfo -F version ixgbevf`.strip == node['ixgbevf']['version']}
end
