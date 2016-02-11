#
# Cookbook Name:: cdo-apps
# Recipe:: default
#
include_recipe 'apt'
include_recipe 'sudo-user'

# These packages are used by Gems we install via Bundler.

# Used by image resizing and certificate generation.
multipackage 'imagemagick'
multipackage 'libmagickcore-dev'
multipackage 'libmagickwand-dev'

# Used by lesson plan generator.
multipackage 'pdftk'
multipackage 'enscript'

# Provides a Dashboard database fixture for Pegasus tests.
multipackage 'libsqlite3-dev'

# Debian-family packages for building Ruby C extensions
multipackage %w(
  autoconf
  binutils-doc
  bison
  build-essential
  flex
  gettext
  ncurses-dev
)

multipackage

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

%w(dashboard pegasus).each do |app|
  node.override['cdo-secrets']["#{app}_port"] = node['cdo-apps'][app]['port']
end
include_recipe 'cdo-secrets'
include_recipe 'cdo-postfix'
include_recipe 'cdo-varnish'

include_recipe 'cdo-apps::bundle_bootstrap'
include_recipe 'cdo-apps::dashboard'
include_recipe 'cdo-apps::pegasus'
include_recipe 'cdo-apps::chef_credentials'
include_recipe 'cdo-apps::crontab'
