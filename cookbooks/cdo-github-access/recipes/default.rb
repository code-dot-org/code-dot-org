#
# Cookbook Name:: cdo-github-access
# Recipe:: default
#
# Provision a GitHub Personal Access Token and/or an SSH key to authenticate git requests to GitHub.
#
# * Adhoc Environments - GitHub rate limits unauthenticated read requests (clone/fetch/pull) particularly for Git LFS
#   reads. Adhoc environments utilize a GitHub Personal Access Token named `code-dot-org-read-only-cicd` provisioned by
#   the `deploy-code-org` user that has read permission to the `code-dot-org` repository. The token is fetched from an
#   AWS Secret during execution of the UserData script (aws/cloudformation/bootstrap_chef_stack.sh.erb). It expires every
#   366 days and GitHub sends email warnings in advance of the expiration.
#
# * Chef Managed Environments (staging, test, levelbuilder, production) - Chef Managed environments sometimes commit
#   and push content to GitHub. They authenticate with an SSH key pair configured on the GitHub user `deploy-code-org`.
#   The contents of these keys are stored in the Chef baseline Role Attributes `cdo-github-access.id_rsa` and
#   `cdo-github-access.id_rsa.pub`.
#   Note that in the rare cases that an engineer provisions an adhoc with the `CHEF_MANAGED=true` setting, the adhoc will
#   have both the token and the SSH key.

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

github_token = node['cdo-github-access']['github_token']

template "#{node[:home]}/.gitconfig" do
  source 'gitconfig.erb'
  mode '644'
  user node[:current_user]
  group node[:current_user]
  variables(
    enable_credential_helper: !github_token.empty?
  )
end

unless github_token.empty?
  file "#{node[:home]}/.git-credentials" do
    content "https://#{github_token}@github.com\n"
    mode '0600'
    user node[:current_user]
    group node[:current_user]
    sensitive true
  end
end

directory "#{node[:home]}/.ssh" do
  mode '0700'
  user node[:current_user]
  group node[:current_user]
end

%w[config id_rsa id_rsa.pub].each do |file|
  template "#{node[:home]}/.ssh/#{file}" do
    source 'file.erb'
    mode '0600'
    user node[:current_user]
    group node[:current_user]
    variables data: node['cdo-github-access'][file]
    not_if {node['cdo-github-access'][file] == ''}
  end
end
