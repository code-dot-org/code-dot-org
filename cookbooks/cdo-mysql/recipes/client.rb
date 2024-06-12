include_recipe 'cdo-mysql::repo'

apt_package 'libmysqlclient-dev'

# It's not entirely clear why we need to explicitly install mysql-client-8.0;
# for some reason, `sudo apt install mysql-client=8.0.36-0ubuntu0.20.04.1`
# fails with `mysql-client : Depends: mysql-client-8.0 but it is not going to
# be installed`, even though I would expect it to be able to install that
# dependency automatically.
apt_package ['mysql-client', 'mysql-client-8.0'] do
  version ['8.0.37-0ubuntu0.20.04.3', '8.0.37-0ubuntu0.20.04.3']
end
