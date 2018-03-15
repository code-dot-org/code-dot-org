# Prerequisite for `pg` gem, which is used to query Redshift.
apt_package 'libpq-dev'

include_recipe 'ark'
ark 'sql-runner' do
  version = node['cdo-analytics']['sql_runner']['version']
  version version
  url "https://dl.bintray.com/snowplow/snowplow-generic/sql_runner_#{version}_linux_amd64.zip"
  checksum node['cdo-analytics']['sql_runner']['checksum']
  strip_components 0
  has_binaries ['sql-runner']
end
