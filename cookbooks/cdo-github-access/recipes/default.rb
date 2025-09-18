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

# Adhocs (unless they have been configured to be CHEF_MANAGED) use a Personal Access Token provisioned by the
# `deploy-code-org` user that has read permission to the `code-dot-org`
# repository to authenticate the git clone/fetch/pull and git lfs pull operations carried out by the local build tasks.
# The token is stored in an AWS Secret that is fetched by the UserData script and passed to the Chef client on first boot
# `aws/cloudformation/bootstrap_chef_stack.sh.erb`
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

# Create git credentials file if GitHub token is provided. Adhocs (unless they've explicitly been
# configured to be Chef-managed) use a read-only GitHub personal access token fetched from an AWS Secret.
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

# Chef Managed environments (staging/test/levelbuilder/production) use an SSH key configured in Chef Attributes
# (cdo-github-access.id_rsa, cdo-github-access.id_rsa.pub) that they use to authenticate to GitHub particularly to commit
# and push content. Adhocs provisioned with `CHEF_MANAGED=true` also have these SSH Chef Attributes in addition to the
# read-only GitHub token provisioned above.
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
