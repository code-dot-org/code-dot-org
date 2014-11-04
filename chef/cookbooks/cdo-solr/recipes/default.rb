#
# Cookbook Name:: cdo-solr
# Recipe:: default
#

include_recipe 'cdo-java-7'

remote_file "#{Chef::Config[:file_cache_path]}/solr-#{node['cdo-solr']['version']}.tgz" do
  source "http://apache.mesi.com.ar/lucene/solr/#{node['cdo-solr']['version']}/solr-#{node['cdo-solr']['version']}.tgz"
end

execute "tar zxvf #{Chef::Config[:file_cache_path]}/solr-#{node['cdo-solr']['version']}.tgz" do
  command "tar zxvf #{Chef::Config[:file_cache_path]}/solr-#{node['cdo-solr']['version']}.tgz"
  cwd "/home/#{node[:current_user]}"
  creates "/home/#{node[:current_user]}/solr-#{node['cdo-solr']['version']}"
end
