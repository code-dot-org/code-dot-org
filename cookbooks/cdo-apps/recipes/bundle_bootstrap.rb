# Bootstrap the first `bundle install` on a new system.

# Although 'rake build' runs `bundle install` itself to keep our gems up to date,
# the Rakefile itself depends on gems to begin with so this bootstrap step is necessary.

env = node.chef_environment
user = node[:user]
home = node[:home]
root = File.join home, env
rack_envs = [:development, :production, :adhoc, :staging, :test, :levelbuilder, :integration]
without = rack_envs - [env.to_sym]
cores = ENV['SPROCKETS_DERAILLEUR_WORKER_COUNT'] || node['cpu']['total']
env = {
  'BUNDLE_WITHOUT' => without.join(':'),
  'BUNDLE_GEMFILE' => "#{root}/Gemfile",
  'BUNDLE_JOBS' => cores.to_s,
  # Ignore any existing 'remembered options' in favor of the provided environment.
  # Ref:
  # http://bundler.io/man/bundle-install.1.html#REMEMBERED-OPTIONS
  # http://bundler.io/man/bundle-config.1.html
  'BUNDLE_IGNORE_CONFIG' => '1',
  # Avoid writing 'remembered options' to the default local config (./bundle/config).
  'BUNDLE_APP_CONFIG' => Chef::Config[:file_cache_path]
}
node.default['cdo-apps']['bundle_env'] = env

# Export bundler environment to global config ($HOME/.bundle/config).
# Used in case we run 'bundle' manually without the provided environment.
directory("#{home}/.bundle") { owner user; group user }

file "#{home}/.bundle/config" do
  owner user
  group user
  content env.to_yaml
end

execute 'bundle-install' do
  command 'bundle install'
  cwd root
  user node[:current_user]
  group node[:current_user]
  environment node['cdo-apps']['bundle_env']
  not_if 'bundle check', cwd: root
end
