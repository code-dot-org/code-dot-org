directory '/usr/local/etc' do
  recursive true
end

cookbook_file '/usr/local/etc/gemrc' do
  action :create_if_missing
  source 'gemrc'
  mode '0644'
end

# Update rubygems to a specific version
if node['cdo-ruby']['rubygems_version']
  execute 'gem update --system' do
    command "gem update -q --system '#{node['cdo-ruby']['rubygems_version']}'"
    environment 'REALLY_GEM_UPDATE_SYSTEM' => '1'
    not_if "which gem && gem --version | grep -q '#{node['cdo-ruby']['rubygems_version']}'"
  end
end

# Clean up no-longer-used root-installed gems.
#
# For context: we previously would install all gems as the root user for our
# deployed web application, but with
# github.com/code-dot-org/code-dot-org/pull/66536 we are now using bundle's
# deployment mode to install them just for our applicaiton.
#
# This command removes all gems installed by the root user and their associated
# executables, leaving only the native gems that come installed by default.
#
# TODO infra: remove this once it has executed successfully on all persistent
# managed servers.
execute 'gem uninstall --all --ignore-dependencies --executables' do
  only_if do
    # We only want to attempt this if we have gems installed at the target
    # locations for both the root and the deployment installation methods.
    #
    # For simplicity, just check for one arbitrary gem. It's a fragile
    # strategy, but this code is intended to be temporary and a false negative
    # is harmless.
    canary = '3.1.0/gems/rails-6.1.7.7'
    Dir.exist?(File.join(node[:home], node.chef_environment, 'vendor/bundle/ruby', canary)) &&
      Dir.exist?(File.join('/usr/local/lib/ruby/gems', canary))
  end
end
