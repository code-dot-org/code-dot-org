#
# Cookbook Name:: cdo-solr
# Recipe:: default
#

include_recipe 'cdo-java-7'

remote_file "#{Chef::Config[:file_cache_path]}/solr-#{node['cdo-solr']['version']}.tgz" do
  source "https://cdo-lib.s3.amazonaws.com/solr-#{node['cdo-solr']['version']}.tgz"
end

execute "tar xvf #{Chef::Config[:file_cache_path]}/solr-#{node['cdo-solr']['version']}.tgz" do
  command "tar xvf #{Chef::Config[:file_cache_path]}/solr-#{node['cdo-solr']['version']}.tgz"
  cwd "/home/#{node[:current_user]}"
  creates "/home/#{node[:current_user]}/solr-#{node['cdo-solr']['version']}"
end
