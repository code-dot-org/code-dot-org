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
    # compile with all 8 cores on our adhoc instances, but only a fraction of prod/staging
    make_opts ['-j 8']
    path '/usr/local/nodejs-source-18.16.0'
    action :install_with_make
    environment(
      C: '/usr/bin/gcc-8',
      CXX: '/usr/bin/g++-8',
      PYTHON: 'python3'
    )
  end

  # remove deb /after/ `make install` to /usr/local/bin/node
  # so there's still /usr/bin/node if the build fails
  package 'nodejs' do
    action :remove
  end
else
  # Install binary nodejs from nodesource apt repo

  # Remove a potential source compile of nodejs, if it exists
  execute 'uninstall_nodejs_source' do
    cwd '/usr/local/nodejs-source-18.16.0'
    command [
      'make uninstall',
      'rm -rf /usr/local/nodejs-source-18.16.0'
    ]
    only_if {File.exist?('/usr/local/nodejs-source-18.16.0')}
  end

  node.default['nodejs']['repo'] = "https://deb.nodesource.com/node_#{node['cdo-nodejs']['version']}"
  include_recipe 'nodejs'

  # Keep nodejs up to date
  package 'nodejs' do
    action :upgrade
  end
end

execute 'enable corepack for yarn support' do
  command 'corepack enable'
end
