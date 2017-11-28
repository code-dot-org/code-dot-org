#
# Cookbook Name:: cdo-solr
# Recipe:: default
#

include_recipe 'cdo-java-7'

version = node['cdo-solr']['version']
solr = "solr-#{version}"

poise_service_user 'solr'

ark 'solr' do
  version version
  url "https://cdo-lib.s3.amazonaws.com/#{solr}.tgz"
  checksum node['cdo-solr']['checksum']
  owner 'solr'
  group 'solr'
end

poise_service 'solr' do
  command 'java -jar start.jar > solr.log 2>&1'
  user 'solr'
  directory '/usr/local/solr/example'
end
