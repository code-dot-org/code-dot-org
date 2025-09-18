#
# Cookbook Name:: cdo-repository
# Recipe:: default
#

# Sync repo via SSH if key is provided. Chef managed instances (staging, test, levelbuilder, production) have
# the SSH key `ubuntu@code.org` provisioned from the Chef `baseline` Role. Adhocs (unless they've explicitly been
# configured to be Chef-managed) use a read-only GitHub personal access token instead.
include_recipe 'cdo-github-access'
has_ssh_key = node['cdo-github-access'] && node['cdo-github-access']['id_rsa'] != ''
if has_ssh_key
  node.override['cdo-repository']['url'] = 'git@github.com:code-dot-org/code-dot-org.git'
end

home_path = node[:home]
git_path = node.default['cdo-repository']['git_path'] = File.join(home_path, node.chef_environment)

# ===== TEMPORARY DIAGNOSTICS =====
execute 'git authentication diagnostics' do
  command <<-EOF
    set -e
    echo "==============================================="
    echo "=== GIT AUTHENTICATION DIAGNOSTIC OUTPUT ==="
    echo "==============================================="
    echo "Timestamp: $(date)"
    echo "Working user: $(whoami)"
    echo "Home directory: $HOME"
    echo "Current working directory: $(pwd)"
    echo ""
    echo "--- Environment Variables ---"
    echo "HOME: $HOME"
    echo "USER: $USER"
    echo "GIT_* variables:"
    env | grep ^GIT || echo "No GIT environment variables set"
    echo ""
    echo "--- Git Global Configuration ---"
    echo "Git version: $(git --version)"
    echo "Global config file location: $(git config --global --list --show-origin | head -1 | cut -d: -f1 || echo 'No global config')"
    git config --global --list | head -20 || echo "No global git config found"
    echo ""
    echo "--- Credential Helper Configuration ---"
    echo "Global credential helper: $(git config --global --get credential.helper || echo 'Not set')"
    echo "Local credential helper: $(git config --get credential.helper || echo 'Not set')"
    echo "All credential config:"
    git config --global --get-regexp credential || echo "No credential config found"
    echo ""
    echo "--- Credential Storage Files ---"
    echo "Git credentials file:"
    if [ -f "$HOME/.git-credentials" ]; then
      echo "  File exists: $HOME/.git-credentials"
      echo "  Permissions: $(ls -la $HOME/.git-credentials)"
      echo "  Contents (sanitized):"
      sed 's/:.*@/:***TOKEN***@/' $HOME/.git-credentials | head -5
    else
      echo "  File not found: $HOME/.git-credentials"
    fi
    echo ""
    echo "--- SSH Configuration ---"
    echo "SSH keys found:"
    ls -la $HOME/.ssh/id_* 2>/dev/null | wc -l || echo "0"
    if [ -f "$HOME/.ssh/config" ]; then
      echo "SSH config exists:"
      ls -la $HOME/.ssh/config
    else
      echo "No SSH config found"
    fi
    echo ""
    echo "--- Testing Credential Helper ---"
    echo "Testing credential fill for github.com:"
    if command -v timeout >/dev/null 2>&1; then
      timeout 5 bash -c 'echo -e "protocol=https\\nhost=github.com\\n" | git credential fill' || echo "Credential fill failed or timed out"
    else
      echo -e "protocol=https\\nhost=github.com\\n" | git credential fill || echo "Credential fill failed"
    fi
    echo ""
    echo "--- Repository URL Configuration ---"
    echo "Target repository URL: #{node['cdo-repository']['url']}"
    echo "Has SSH key: #{has_ssh_key}"
    echo "Git path destination: #{git_path}"
    echo ""
    echo "--- Network Connectivity Test ---"
    echo "Testing GitHub connectivity:"
    if command -v curl >/dev/null 2>&1; then
      curl -I -s --connect-timeout 5 https://github.com | head -1 || echo "HTTPS connection to github.com failed"
    else
      echo "curl not available for connectivity test"
    fi
    if #{has_ssh_key}; then
      echo "Testing SSH connectivity to GitHub:"
      ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -T git@github.com 2>&1 | head -3 || echo "SSH connection to github.com failed"
    else
      echo "SSH key not configured, skipping SSH connectivity test"
    fi
    echo ""
    echo "--- Git Authentication Test ---"
    echo "Testing git ls-remote (this will show if authentication works):"
    if command -v timeout >/dev/null 2>&1; then
      timeout 10 git ls-remote --heads #{node['cdo-repository']['url']} | head -5 || echo "Git ls-remote failed"
    else
      git ls-remote --heads #{node['cdo-repository']['url']} | head -5 || echo "Git ls-remote failed"
    fi
    echo ""
    echo "--- File System Permissions ---"
    echo "Home directory permissions:"
    ls -ld $HOME
    echo "Git-related file permissions:"
    ls -la $HOME/.git* 2>/dev/null || echo "No .git* files found in home directory"
    echo ""
    echo "==============================================="
    echo "=== END DIAGNOSTIC OUTPUT ==="
    echo "==============================================="
    echo ""
  EOF

  user node[:user]
  group node[:user]
  environment(
    'HOME' => home_path,
    'USER' => node[:user]
  )

  # Always run diagnostics for debugging
  action :run
end
# ===== END TEMPORARY DIAGNOSTICS =====

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

  # Ensure proper environment for credential helper
  environment(
    'HOME' => home_path,
    'USER' => node[:user]
  )
end

# ===== ADDITIONAL DIAGNOSTICS POST-GIT =====
# Only run if the git operation succeeds
execute 'post-git diagnostics' do
  command <<-EOF
    echo "==============================================="
    echo "=== POST-GIT OPERATION DIAGNOSTICS ==="
    echo "==============================================="
    echo "Git operation completed successfully!"
    echo "Repository destination: #{git_path}"
    echo "Repository exists: $(test -d #{git_path} && echo 'YES' || echo 'NO')"
    if [ -d "#{git_path}" ]; then
      echo "Current branch: $(cd #{git_path} && git rev-parse --abbrev-ref HEAD)"
      echo "Last commit: $(cd #{git_path} && git log -1 --oneline)"
      echo "Remote URLs: $(cd #{git_path} && git remote -v)"
    fi
    echo "==============================================="
  EOF

  user node[:user]
  group node[:user]
  environment(
    'HOME' => home_path,
    'USER' => node[:user]
  )

  # Only run if git resource was successful
  subscribes :run, "git[#{git_path}]", :immediately
  action :nothing
end
# ===== END POST-GIT DIAGNOSTICS =====

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
    environment('HOME' => home_path)
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
    environment('HOME' => home_path)
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
