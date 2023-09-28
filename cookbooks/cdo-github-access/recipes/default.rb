#
# Cookbook Name:: cdo-github-access
# Recipe:: default
#

apt_repository 'git-core' do
  uri          'ppa:git-core/ppa'
  distribution 'trusty'
  retries 3
end

apt_package 'git'

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

# The staging server requires a special worktree at a hardcoded location in
# order to successfully run the `deploy_to_levelbuilder` and
# `merge_lb_to_staging` scripts.
# TODO: remove the or case once I've verified this functionality
if node.chef_environment == 'staging' || node.chef_environment == 'adhoc'
  worktree_path = File.join(node[:home], 'deploy-management-repo')
  execute 'create worktree for managing deployment scripts' do
    command "git worktree add #{worktree_path}"
    cwd File.join(node[:home], node.chef_environment)
    user node[:current_user]
    group node[:current_user]
    not_if {File.exist? worktree_path}
  end
end
