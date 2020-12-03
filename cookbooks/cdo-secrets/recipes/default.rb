#
# Cookbook Name:: cdo-secrets
# Recipe:: default
#

include_recipe 'cdo-secrets::globals'
include_recipe 'cdo-secrets::words'
include_recipe 'cdo-secrets::app' if node['cdo-repository']
