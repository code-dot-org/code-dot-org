# Bootstrap the first `bundle install` on a new system.
# Although 'rake build' runs `bundle install` itself to keep our gems up to date,
# the Rakefile itself depends on gems to begin with.

env = node.chef_environment
root = "/home/#{node[:current_user]}/#{env}"
rack_envs = [:development, :production, :adhoc, :staging, :test, :levelbuilder, :integration]
without = rack_envs - [env.to_sym]
cores = ENV['SPROCKETS_DERAILLEUR_WORKER_COUNT'] || node['cpu']['total']
env = {
  BUNDLE_IGNORE_CONFIG: '1',
  BUNDLE_WITHOUT: without.join(':'),
  BUNDLE_GEMFILE: "#{root}/Gemfile",
  BUNDLE_JOBS: cores.to_s,
  BUNDLE_APP_CONFIG: Chef::Config[:file_cache_path]
}
node.default['cdo-apps']['bundle_env'] = env

execute 'bundle-install' do
  command 'bundle install'
  cwd root
  user node[:current_user]
  group node[:current_user]
  environment node['cdo-apps']['bundle_env']
  not_if 'bundle check', cwd: root
end
