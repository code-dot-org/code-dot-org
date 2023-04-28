#
# Cookbook Name:: cdo-nodejs
# Recipe:: default
#

is_ubuntu_18_04 = node['platform'] == 'ubuntu' && node['platform_version'] == '18.04'
is_node_18 = node['cdo-nodejs']['version'] == '18.x'

if is_ubuntu_18_04 && is_node_18
  # No nodesource binary for NodeJS 18 on Ubuntu 18.04
  # Compile from source instead, using gcc-8

  build_essential 'install build tools'

  package %w(libssl-dev python g++ g++-8 gcc-8)

  ark 'nodejs-source' do
    url 'https://nodejs.org/dist/v18.16.0/node-v18.16.0.tar.gz'
    checksum '6a4f5c5d76e5c50cef673099e56f19bc3266ae363f56ca0ab77dd2f3c5088c6d'
    version '18.16.0'
    make_opts ['-j 8']
    action :install_with_make
    environment(
      C: '/usr/bin/gcc-8',
      CXX: '/usr/bin/g++-8',
      PYTHON: 'python3'
    )
  end

  package 'nodejs' do
    action :remove
  end
else
  node.default['nodejs']['repo'] = "https://deb.nodesource.com/node_#{node['cdo-nodejs']['version']}"
  include_recipe 'nodejs'

  # Keep nodejs up to date
  package 'nodejs' do
    action :upgrade
  end
end

apt_repository "yarn" do
  uri "https://dl.yarnpkg.com/debian/"
  distribution 'stable'
  components ['main']
  key "https://dl.yarnpkg.com/debian/pubkey.gpg"
end

apt_package 'yarn' do
  version node['cdo-nodejs']['yarn_version']
end
