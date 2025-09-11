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

# Use a Personal Access Token provisioned by the `deploy-code-org` user that has read permission to the `code-dot-org`
# repository to authenticate the git clone/fetch/pull and git lfs pull operations carried out by the local build tasks.
# The token is stored in an AWS Secret that is fetched by the UserData script and passed to the Chef client on first boot
# `aws/cloudformation/bootstrap_chef_stack.sh.erb`
github_token = node['cdo-github-access']['github_token']
unless github_token.empty?
  # Configure git credential helper for GitHub token
  execute 'configure git credential helper for github token' do
    command "git config --global credential.helper store"
    user node[:current_user]
    group node[:current_user]
    environment('HOME' => node[:home])
    not_if "git config --global --get credential.helper | grep -q store",
           user: node[:current_user],
           environment: {'HOME' => node[:home]}
  end

  file "#{node[:home]}/.git-credentials" do
    content "https://#{github_token}@github.com\n"
    mode '0600'
    user node[:current_user]
    group node[:current_user]
    sensitive true
  end
end
