include_recipe 'cdo-mysql::repo'

apt_package 'libmysqlclient-dev'

mysql_client_packages = ['mysql-client']
mysql_client_versions = ['5.7.42-1ubuntu18.04']

# It's not entirely clear why this needs to be explicitly installed; for some
# reason, `sudo apt install mysql-client=8.0.37-0ubuntu0.20.04.3` fails with
# `mysql-client : Depends: mysql-client-8.0 but it is not going to be
# installed`, even though I would expect it to be able to install that
# dependency automatically.
if node['cdo-mysql']['target_version'] == '8.0'
  mysql_client_packages << 'mysql-client-8.0'
  mysql_client_versions = ['8.0.37-0ubuntu0.20.04.3', '8.0.37-0ubuntu0.20.04.3']
end

apt_package mysql_client_packages do
  version mysql_client_versions
end
