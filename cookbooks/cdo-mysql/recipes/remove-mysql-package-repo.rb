# MySQL switch to Ubuntu Repo:
# This cleans up the old mysql apt repository, which is no longer used.
# We can remove this after transition back to the ubuntu repo:

# remove the sources.list for mysql
apt_repository 'mysql' do
  action :remove
end

# remove mysql client packages from the old package repo:
apt_package ['mysql-client', 'mysql-client-8.0'] do
  action :remove
  version ['8.0.37-0ubuntu0.20.04.3', '8.0.37-0ubuntu0.20.04.3']
end

# remove mysql server packages from the old package repo:
apt_package 'mysql-server' do
  action :remove
  version '8.0.37-0ubuntu0.20.04.3'
end
