#
# Cookbook Name:: cdo-apps
# Recipe:: default
#

# Update Chef Client to version specified by node['omnibus_updater']['version'].
include_recipe 'omnibus_updater'

include_recipe 'apt'
include_recipe 'sudo-user'
include_recipe 'cdo-networking'

# Set hostname to the Chef node name (via chef_hostname cookbook)
HOSTNAME_INVALID_CHAR = /[^[:alnum:]-]/
hostname node.name.downcase.gsub(HOSTNAME_INVALID_CHAR, '-')

# These packages are used by Gems we install via Bundler.

# Used by image resizing and certificate generation.
apt_package %w(
  imagemagick
  libmagickcore-dev
  libmagickwand-dev
)

# Used by lesson plan generator.
apt_package %w(
  pdftk
  enscript
)

# Provides a Dashboard database fixture for Pegasus tests.
apt_package 'libsqlite3-dev'

# Debian-family packages for building Ruby C extensions
apt_package %w(
  autoconf
  binutils-doc
  bison
  build-essential
  flex
  gettext
  ncurses-dev
)

#multipackage

include_recipe 'cdo-mysql::client'
# Install local mysql server unless an external db url is provided.
unless node['cdo-secrets'] && node['cdo-secrets']['db_writer']
  include_recipe 'cdo-mysql::server'
end

include_recipe 'cdo-ruby'

# Ensure the correct locale is generated and set as default (e.g. for Docker containers).
locale = 'en_US.UTF-8'

execute "locale-gen #{locale}" do
  not_if { File.exist? '/var/lib/locales/supported.d/local' }
end

execute 'update-locale' do
  environment LANG: locale
  not_if { File.exist? '/etc/default/locale' }
end

include_recipe 'cdo-repository'

include_recipe 'cdo-apps::workers'

%w(dashboard pegasus).each do |app|
  node.override['cdo-secrets']["#{app}_port"] = node['cdo-apps'][app]['port']
end
include_recipe 'cdo-secrets'
include_recipe 'cdo-postfix'
include_recipe 'cdo-varnish'

include_recipe 'cdo-apps::bundle_bootstrap'

# Install optional package build targets if specified in attributes.
%w(code_studio apps blockly_core).each do |package|
  include_recipe "cdo-apps::#{package}" if node['cdo-secrets'] && node['cdo-secrets']["build_#{package}"]
end

include_recipe 'cdo-apps::dashboard'
include_recipe 'cdo-apps::pegasus'
include_recipe node['cdo-apps']['nginx_enabled'] ?
  'cdo-nginx' :
  'cdo-nginx::stop'
include_recipe 'cdo-apps::chef_credentials'
include_recipe 'cdo-apps::crontab'
