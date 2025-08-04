# In preparation for no longer running `bundle install` as root, we install a
# local deployment version of our gem dependencies. Once it exists, we can on a
# subsequent build switch over to actually use it.
#
# TODO infra: remove this recipe once we've fully migrated all servers

root_dir = File.join(node[:home], node.chef_environment)
['', 'dashboard', 'cookbooks'].each do |subdir|
  project_dir = File.join(root_dir, subdir)
  next unless Dir.exist?(project_dir)

  bundle_dir = File.join(project_dir, '.bundle')
  vendor_dir = File.join(project_dir, 'vendor/bundle')

  # First, re-own the existing root-owned bundle config and install directories
  # See https://github.com/code-dot-org/code-dot-org/pull/66536
  execute "change ownership of #{subdir} .bundle directory" do
    command "chown -R #{node[:user]}:#{node[:user]} #{bundle_dir}"
    user 'root'
    only_if {Dir.exist?(bundle_dir)}
  end

  execute "change ownership of #{subdir} vendord/bundle directory" do
    command "chown -R #{node[:user]}:#{node[:user]} #{vendor_dir}"
    user 'root'
    only_if {Dir.exist?(vendor_dir)}
  end

  # Second, run bundle install in deployment mode, which will as a side effect
  # update the config file to include the deployment option.
  execute "install #{subdir} gems in deployment mode" do
    command 'bundle install --deployment'
    user node[:user]
    cwd project_dir
    not_if {Dir.exist?(vendor_dir)}
  end

  # Finally, undo the change to the config file. We'll reenable this setting on
  # a future build.
  execute "reset deployment config" do
    command 'bundle config unset deployment'
    user node[:user]
    cwd project_dir
    only_if "grep DEPLOYMENT #{File.join(bundle_dir, 'config')}"
  end
end
