# Delegate to appropriate recipe depending on version
if node['cdo-ruby']['version'].to_f > 2.0
  include_recipe 'cdo-ruby::2.0-remove'
  include_recipe 'cdo-ruby::brightbox'
else
  include_recipe 'cdo-ruby::2.0'
end

gem_package 'rake'
gem_package 'bundler' do
  action :upgrade
  version node['cdo-ruby']['bundler_version']
end

# git is required for using git repos with bundler
apt_package 'git'
