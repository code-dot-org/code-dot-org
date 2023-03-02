include_recipe 'cdo-ruby::brightbox'
gem_package 'rake' do
  action :upgrade
  version node['cdo-ruby']['rake_version']
end

# git is required for using git repos with bundler
apt_package 'git'

gem_package 'bundler' do
  action :upgrade
  version node['cdo-ruby']['bundler_version']
end

template "#{node[:home]}/.gemrc" do
  source 'gemrc.erb'
  user node[:user]
  group node[:user]
end
