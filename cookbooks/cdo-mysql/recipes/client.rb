include_recipe 'cdo-mysql::repo'

# We don't need to install a MySQL 5.7-specific libmysqlclient library,
# since the 8.0 version distributed by default is backwards-compatible
# all the way back to MySQL 5.5
apt_package 'libmysqlclient-dev'

# This package get installed by default with the upgrade from Ubuntu 18 to 20,
# but with it installed, we get an error when attempting to install
# mysql-community-client, which is a dependency of mysql-client:
#
# dpkg: error processing archive /var/cache/apt/archives/mysql-community-client_5.7.42-1ubuntu18.04_amd64.deb (--unpack):
#  trying to overwrite '/usr/share/mysql/charsets/Index.xml', which is also in package mysql-server-core-8.0 8.0.34-0ubuntu0.20.04.1
#  Errors were encountered while processing:
#   /var/cache/apt/archives/mysql-community-client_5.7.42-1ubuntu18.04_amd64.deb
apt_package 'mysql-server-core-8.0' do
  action :remove
end

apt_package 'mysql-client' do
  version '5.7.42-1ubuntu18.04'
end
