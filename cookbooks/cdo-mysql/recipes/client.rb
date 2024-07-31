# MySQL switch to Ubuntu Repo:
# This cleans up the old mysql apt repository, which is no longer used.
# We can remove this after transition back to the ubuntu repo:
include_recipe 'cdo-mysql::remove-mysql-package-repo'

include_recipe 'apt'

apt_package 'libmysqlclient-dev'

# It's not entirely clear why we need to explicitly install mysql-client-8.0;
# for some reason, `sudo apt install mysql-client=8.0.36-0ubuntu0.20.04.1`
# fails with `mysql-client : Depends: mysql-client-8.0 but it is not going to
# be installed`, even though I would expect it to be able to install that
# dependency automatically.
apt_package ['mysql-client', 'mysql-client-8.0'] do
  version ['8.0.39-0ubuntu0.20.04.1', '8.0.39-0ubuntu0.20.04.1']
end
