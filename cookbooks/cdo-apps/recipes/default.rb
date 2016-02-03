#
# Cookbook Name:: cdo-apps
# Recipe:: default
#
include_recipe 'apt'
include_recipe 'sudo-user'

# These packages are used by Gems we install via Bundler.

# Used by image resizing and certificate generation.
apt_package 'imagemagick'
apt_package 'libmagickcore-dev'
apt_package 'libmagickwand-dev'

# Used by lesson plan generator.
apt_package 'pdftk'
apt_package 'enscript'

# Provides a Dashboard database fixture for Pegasus tests.
apt_package 'libsqlite3-dev'

include_recipe 'build-essential'
include_recipe 'cdo-mysql::client'
# Install local mysql server unless an external db url is provided.
unless node['cdo-secrets'] && node['cdo-secrets']['db_writer']
  include_recipe 'cdo-mysql::server'
end

include_recipe 'cdo-ruby'

# Ensure that all locale environment variables are properly set to UTF-8.
execute 'locales' do
  command 'locale-gen en_US.UTF-8 && update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8'
end

include_recipe 'cdo-apps::dashboard'
include_recipe 'cdo-apps::pegasus'
include_recipe 'cdo-apps::chef_credentials'
include_recipe 'cdo-apps::crontab'
