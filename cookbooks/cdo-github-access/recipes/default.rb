#
# Cookbook Name:: cdo-github-access
# Recipe:: default
#
apt_package 'gnupg'

apt_repository 'git-core' do
  uri          'ppa:git-core/ppa'
  distribution 'trusty'
  retries 3
end

apt_package 'git'

# Install Git LFS, from: https://packagecloud.io/github/git-lfs/install#chef
packagecloud_repo "github/git-lfs" do
  type "deb"
end

apt_package 'git-lfs'

cookbook_file "#{node[:home]}/.gitconfig" do
  source 'gitconfig'
  mode '644'
  user node[:current_user]
  group node[:current_user]
end

directory "#{node[:home]}/.ssh" do
  mode '0700'
  user node[:current_user]
  group node[:current_user]
end

[
  'config',
  'id_rsa',
  'id_rsa.pub',
].each do |file|
  template "#{node[:home]}/.ssh/#{file}" do
    source 'file.erb'
    mode '0600'
    user node[:current_user]
    group node[:current_user]
    variables data: node['cdo-github-access'][file]
    not_if {node['cdo-github-access'][file] == ''}
  end
end
