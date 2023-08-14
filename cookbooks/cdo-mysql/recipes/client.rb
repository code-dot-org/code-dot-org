include_recipe 'cdo-mysql::repo'

# We don't need to install a MySQL 5.7-specific libmysqlclient library,
# since the 8.0 version distributed by default is backwards-compatible
# all the way back to MySQL 5.5
apt_package 'libmysqlclient-dev'

apt_package 'mysql-client' do
  version '5.7.42-1ubuntu18.04'
end
