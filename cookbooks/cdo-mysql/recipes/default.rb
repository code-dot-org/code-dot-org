#
# Cookbook Name:: cdo-mysql
# Recipe:: default
#

# If we're on Ubuntu 18, manually enable the MySQL repositories required to
# install 8.x. If we're on a more-recent version, those repositories should be
# provided by default.
#
# TODO: remove this block once we've updated to Ubuntu 20+
is_ubuntu_18_04 = node['platform'] == 'ubuntu' && node['platform_version'] == '18.04'
mysql_apt_config_filename = 'mysql-apt-config_0.8.26-1_all.deb'
mysql_apt_config_file = "#{Chef::Config[:file_cache_path]}/#{mysql_apt_config_filename}"
if is_ubuntu_18_04
  remote_file(mysql_apt_config_file) do
    source "https://dev.mysql.com/get/#{mysql_apt_config_filename}"
    checksum 'c03ee48d5fda09fcd9e395963efcd907'
  end
  dpkg_package('mysql-apt-config') do
    source mysql_apt_config_file
    version '0.8.26-1'
  end
else
  execute 'remove old mysql-apt-config .deb' do
    command "rm #{mysql_apt_config_file}"
    only_if {File.exist?(mysql_apt_config_file)}
  end
end

include_recipe 'cdo-mysql::client'

# Install server unless an external writer endpoint is provided.
writer = URI.parse(node['cdo-secrets']['db_writer'].to_s)
include_recipe 'cdo-mysql::server' unless writer.hostname

# Install ProxySQL if enabled.
if node['cdo-mysql']['proxy']['enabled']
  include_recipe 'cdo-mysql::proxy'
end
