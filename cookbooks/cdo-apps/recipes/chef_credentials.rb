# Adds 'cdo-ci' Chef user credentials to daemon servers.
# This allows `knife` commands to be run as the 'cdo-ci' user on daemon servers,
# for uploading Chef cookbooks and updating per-environment cookbook constraints from the CI script.
# The 'cdo-apps.cdo-ci' attribute must be provided in a Chef attribute on the chef-repo.
user = node[:user]
home = node[:home]

if node['cdo-apps']['daemon'] && node['cdo-apps']['cdo-ci']
  directory "#{home}/.chef" do
    owner user
  end
  file "#{home}/.chef/cdo-ci.pem" do
    content node['cdo-apps']['cdo-ci']
    sensitive true
    mode '0600'
    owner user
  end
end
