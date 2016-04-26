#
# Cookbook Name:: cdo-postfix
# Recipe:: default
#

node.override['postfix']['main']['myorigin'] = node['cdo-postfix']['origin']
node.override['postfix']['main']['relayhost'] = "[#{node['cdo-postfix']['host']}]:#{node['cdo-postfix']['port']}"
node.default['postfix']['main']['smtp_sasl_auth_enable'] = 'yes'
node.override['postfix']['sasl']['smtp_sasl_user_name'] = node['cdo-postfix']['username']
node.override['postfix']['sasl']['smtp_sasl_passwd'] = node['cdo-postfix']['password']
include_recipe 'postfix'
