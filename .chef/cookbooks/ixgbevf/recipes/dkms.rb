#
# Cookbook Name:: ixgbevf
# Recipe:: dkms
#
# Copyright (C) 2015 Joe Hohertz
#

if node['platform_family'] == 'rhel'
  include_recipe 'yum-epel'
  #package 'kernel-headers'
  package 'kernel-headers' do
    version node['kernel']['release'].chomp('.x86_64')
  end
  package 'kernel-devel' do
    version node['kernel']['release'].chomp('.x86_64')
  end
  package 'perl'
  package 'dkms'
elsif node['platform_family'] == 'debian'
  include_recipe 'apt'
  # no prep needed for debian family
  package 'linux-headers-amd64' if node['platform'] != "ubuntu"
  package 'perl'
  package 'dkms'
else
  raise "Platform family not supported: #{node['platform_family']}"
end

