include_recipe 'cdo-mysql::repo'

apt_package 'libmysqlclient-dev' do
  version '5.7*'
end

apt_package 'mysql-client' do
  version '5.7*'
end
