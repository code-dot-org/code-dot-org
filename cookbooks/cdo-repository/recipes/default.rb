#
# Cookbook Name:: cdo-repository
# Recipe:: default
#

# Chef Managed environments (staging/test/levelbuilder/production) use an SSH key configured in Chef Attributes
# (cdo-github-access.id_rsa, cdo-github-access.id_rsa.pub) that they use to authenticate to GitHub particularly to commit
# and push content. Adhocs provisioned with `CHEF_MANAGED=true` (rare) also have these SSH Chef Attributes in addition to a
# read-only GitHub token that is provisioned on all adhocs from an AWS Secret.
include_recipe 'cdo-github-access'
has_ssh_key = node['cdo-github-access'] && node['cdo-github-access']['id_rsa'] != ''
if has_ssh_key
  node.override['cdo-repository']['url'] = 'git@github.com:code-dot-org/code-dot-org.git'
end

home_path = node[:home]
git_path = node.default['cdo-repository']['git_path'] = File.join(home_path, node.chef_environment)

git git_path do
  provider Cdo::Provider::Git

  repository node['cdo-repository']['url']
  depth node['cdo-repository']['depth'] if node['cdo-repository']['depth']

  branch = node['cdo-repository']['branch']
  checkout_branch branch
  revision branch

  action(
    # Skip git-repo sync when using a shared volume to prevent data loss on the host.
    if GitHelper.shared_volume? git_path, home_path
      :nothing

    # Sync instead of checkout only for special, non-CI-managed instances via 'sync' attribute.
    elsif node['cdo-repository']['sync']
      :sync

    # Default checkout-only for CI-managed instances. (CI script manages pull on updates)
    else
      :checkout
    end
  )

  # Build app on repo updates.
  if node['cdo-apps']
    notifies :run, "execute[build-cdo]", :delayed
  end

  user node[:user]
  group node[:user]
end

# The staging server requires a special worktree at a hardcoded location in
# order to successfully run the `deploy_to_levelbuilder` and
# `merge_lb_to_staging` scripts.
if node.chef_environment == 'staging'
  worktree_path = File.join(home_path, 'deploy-management-repo')

  execute 'create worktree for managing deployment scripts' do
    command "git worktree add #{worktree_path}"
    cwd git_path
    user node[:user]
    group node[:user]
    not_if {File.exist? worktree_path}
  end
end

# Create sparse checkout of staging content directories on production-daemon
# for the purpose of content seeding.
if node['cdo-apps']['daemon'] && %w[production].include?(node.chef_environment)
  worktree_path = File.join(home_path, 'staging')

  execute 'create worktree for managing deployment scripts' do
    command "git worktree add #{worktree_path}"
    cwd git_path
    user node[:user]
    group node[:user]
    not_if {File.exist? worktree_path}
  end

  # TODO: implement a sparse checkout for added assurance that staging code
  # is not making its way into production.

  # execute 'initiate sparse checkout of staging worktree' do
  #   command "git sparse-checkout dashboard/config"
  #   cwd worktree_path
  #   user node[:user]
  #   group node[:user]
  # end
end
