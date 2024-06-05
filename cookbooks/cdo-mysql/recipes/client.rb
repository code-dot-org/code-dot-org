include_recipe 'cdo-mysql::repo'

apt_package 'libmysqlclient-dev'

apt_package 'mysql-client' do
  if node['cdo-mysql']['target_version'] == '5.7'
    version '5.7.42-1ubuntu18.04'
  elsif node['cdo-mysql']['target_version'] == '8.0'
    version '8.0.37-1ubuntu20.04'
  end
end
