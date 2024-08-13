#
# Cookbook Name:: cdo-apps
# Recipe:: default
#

# Update Chef Client to version specified by node['omnibus_updater']['version'].
chef_client_updater 'install' do
  version node['omnibus_updater']['version']
  post_install_action Chef::Config[:interval] ? 'kill' : 'exec'
end

include_recipe 'apt'

include_recipe 'cdo-apps::hostname'

# These packages are used by Gems we install via Bundler.

# Used by image resizing and certificate generation.
apt_package %w(
  imagemagick
  libmagickcore-dev
  libmagickwand-dev
  fonts-noto
)

# Used by lesson plan generator; we install on staging so the actual
# functionality will work, on test so we can test that functionality, and on
# adhoc so we can verify that installation continues to work
if %w(staging test adhoc).include?(node.chef_environment)
  pdftk_file = 'pdftk-java_3.0.9-1_all.deb'
  pdftk_local_file = "#{Chef::Config[:file_cache_path]}/#{pdftk_file}"
  remote_file pdftk_local_file do
    source "https://mirrors.kernel.org/ubuntu/pool/universe/p/pdftk-java/#{pdftk_file}"
    checksum "e14dfd5489e7becb5d825baffc67ce1104e154cd5c8b445e1974ce0397078fdb"
    action :create_if_missing
  end
  # Dependencies of pdftk-java.
  apt_package %w(
    default-jre-headless
    libbcprov-java
    libcommons-lang3-java
  )
  dpkg_package("pdftk-java") {source pdftk_local_file}
end

# Used by lesson plan generator.
apt_package 'enscript'

# Install dependencies required to sync content between our Code.org shared
# Dropbox folder and our git repository. Also check whether the tool that
# performs the sync is installed, and display instructions for how to do so if
# it isn't. Ideally, we would be able to install the tool with this code, but
# the process is sufficiently interactive and we have to do it sufficiently
# rarely that we think documentation will suffice for now.
if node.chef_environment == 'staging'
  apt_package 'unison'
  dropbox_daemon_file = File.join(node[:home], '.dropbox-dist/dropboxd')
  unless File.exist?(dropbox_daemon_file)
    environment_name = node.chef_environment.inspect
    Chef.event_handler do
      on :run_completed do
        Chef::Log.warn("Chef environment #{environment_name} expects the Dropbox Daemon to be configured.")
        Chef::Log.warn('Follow the instructions at https://www.dropbox.com/install-linux to do so')
      end
    end
  end
end

include_recipe 'cdo-python'

# Debian-family packages for building Ruby C extensions
apt_package %w(
  autoconf
  binutils-doc
  bison
  build-essential
  flex
  gettext
  ncurses-dev
  cmake
)

include_recipe 'cdo-ruby'

# Ensure the correct locale is generated and set as default (e.g. for Docker containers).
locale = 'en_US.UTF-8'

execute "locale-gen #{locale}" do
  not_if {File.exist? '/var/lib/locales/supported.d/local'}
end

execute 'update-locale' do
  environment LANG: locale
  not_if {File.exist? '/etc/default/locale'}
end

include_recipe 'cdo-repository'

include_recipe 'cdo-apps::workers'

%w(dashboard pegasus).each do |app|
  node.override['cdo-secrets']["#{app}_port"] = node['cdo-apps'][app]['port']
end
node.default['cdo-secrets']['daemon'] = node['cdo-apps']['daemon'] if node['cdo-apps']['daemon']

include_recipe 'cdo-secrets'
include_recipe 'cdo-mysql'
include_recipe 'cdo-postfix'
include_recipe 'cdo-cloudwatch-agent'
include_recipe 'cdo-syslog'

# Production analytics utilities (also install on adhoc environments to as an integration test of the recipe).
include_recipe 'cdo-analytics' if %w[production-daemon production-console].include?(node.name) || node.chef_environment == 'adhoc'

include_recipe 'cdo-apps::jemalloc' if node['cdo-apps']['jemalloc']
include_recipe 'cdo-apps::bundle_bootstrap'
include_recipe 'cdo-apps::build'

# Install nodejs if apps build specified in attributes.
if node['cdo-secrets']["build_apps"] ||
    # Or install nodejs if the daemon builds apps packages in this environment.
    # TODO keep this logic in sync with `BUILD_PACKAGE` in `package.rake`.
    (node['cdo-apps']['daemon'] && %w[staging test adhoc].include?(node.chef_environment))
  include_recipe 'cdo-nodejs'
  include_recipe 'cdo-apps::google_chrome'
  include_recipe 'cdo-apps::generate_pdf'
  apt_package 'parallel' # Used by apps/run-tests-in-parallel.sh
end

# Workaround for lack of zoneinfo in docker: https://forums.docker.com/t/synchronize-timezone-from-host-to-container/39116/3
# which causes this error: https://github.com/tzinfo/tzinfo/wiki/Resolving-TZInfo::DataSourceNotFound-Errors
apt_package 'tzdata'

include_recipe 'cdo-apps::logrotate'

include_recipe 'cdo-apps::dashboard'
include_recipe 'cdo-apps::pegasus'
include_recipe node['cdo-apps']['nginx_enabled'] ?
  'cdo-nginx' :
  'cdo-nginx::stop'
include_recipe 'cdo-apps::chef_credentials'
include_recipe 'cdo-apps::crontab'

node.default['cdo-apps']['local_redis'] = !node['cdo-secrets']['redis_primary']
include_recipe 'cdo-redis' if node['cdo-apps']['local_redis']

# only the i18n server needs the i18n recipe
include_recipe 'cdo-i18n' if node.name == 'i18n'

# Daemon-specific configuration for SSH access to frontend instances.
include_recipe 'cdo-apps::daemon_ssh' if node['cdo-apps']['daemon'] && node['cdo-apps']['frontends']

include_recipe 'cdo-tippecanoe' if node['cdo-apps']['daemon']

include_recipe 'cdo-apps::rbspy'

include_recipe 'cdo-apps::syslog_permissions'
