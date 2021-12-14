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
include_recipe 'sudo-user'

include_recipe 'cdo-apps::hostname'

# These packages are used by Gems we install via Bundler.

# Used by image resizing and certificate generation.
apt_package %w(
  imagemagick
  libmagickcore-dev
  libmagickwand-dev
  fonts-noto
)

# Used by lesson plan generator.
pdftk_file = 'pdftk-java_3.1.1-1_all.deb'
pdftk_local_file = "#{Chef::Config[:file_cache_path]}/#{pdftk_file}"
remote_file pdftk_local_file do
  source "https://mirrors.kernel.org/ubuntu/pool/universe/p/pdftk-java/#{pdftk_file}"
  checksum "8a28ba8b100bc0b6e9f3e91c090a9b8a83a5f8a337a91150cbaadad8accb4901"
end
# Dependencies of pdftk-java.
apt_package %w(
  default-jre-headless
  libbcprov-java
  libcommons-lang3-java
)
dpkg_package("pdftk-java") {source pdftk_local_file}

# Used by lesson plan generator.
apt_package 'enscript'

# Provides a Dashboard database fixture for Pegasus tests.
apt_package 'libsqlite3-dev'

# Used to sync content between our Code.org shared Dropbox folder
# and our git repository.
apt_package 'unison' if node.chef_environment == 'staging'

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
include_recipe 'cdo-varnish'

include_recipe 'cdo-cloudwatch-agent'
include_recipe 'cdo-syslog'

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
  apt_package 'parallel' # Used by test-low-memory.sh to run apps tests in parallel
end

# Workaround for lack of zoneinfo in docker: https://forums.docker.com/t/synchronize-timezone-from-host-to-container/39116/3
# which causes this error: https://github.com/tzinfo/tzinfo/wiki/Resolving-TZInfo::DataSourceNotFound-Errors
apt_package 'tzdata'

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

# Production analytics utilities.
include_recipe 'cdo-analytics' if %w[production-daemon production-console].include?(node.name)

# Daemon-specific configuration for SSH access to frontend instances.
include_recipe 'cdo-apps::daemon_ssh' if node['cdo-apps']['daemon'] && node['cdo-apps']['frontends']

include_recipe 'cdo-apps::lighthouse' if node.chef_environment == 'test'

include_recipe 'cdo-tippecanoe' if node['cdo-apps']['daemon']

# Patch to fix issue with systemd-resolved: https://bugs.launchpad.net/ubuntu/+source/systemd/+bug/1805183
include_recipe 'cdo-apps::resolved'

include_recipe 'cdo-apps::rbspy'

include_recipe 'cdo-apps::syslog_permissions'
