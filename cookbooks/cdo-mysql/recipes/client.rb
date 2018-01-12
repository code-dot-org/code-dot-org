include_recipe 'cdo-mysql::repo'

apt_package 'libmysqlclient-dev'
apt_package 'mysql-client'
