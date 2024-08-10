# Install Ruby via ruby-build, as recommended by Ruby docs
#
# Based on instructions at:
#   https://www.ruby-lang.org/en/documentation/installation/#ruby-build
#   https://github.com/rbenv/ruby-build#readme

# Arbitrarily use the latest version of ruby build at time this code was
# written; this probably doesn't matter, but we need to pick something.
RUBY_BUILD_VERSION = '20240727'.freeze

remote_file "/tmp/ruby-build-#{RUBY_BUILD_VERSION}.tar.gz" do
  source "https://github.com/rbenv/ruby-build/archive/refs/tags/v#{RUBY_BUILD_VERSION}.tar.gz"
  action :create_if_missing
end

archive_file "/tmp/ruby-build-#{RUBY_BUILD_VERSION}.tar.gz" do
  destination '/tmp/ruby-build'
  overwrite :auto
end

execute 'install ruby-build' do
  cwd "/tmp/ruby-build/ruby-build-#{RUBY_BUILD_VERSION}"
  command './install.sh'
  not_if "which ruby-build && ruby-build --version | grep --quiet --fixed-strings 'ruby-build #{RUBY_BUILD_VERSION}'"
end

# Install dependencies require for ruby-build to succeed
# List taken from: https://github.com/rbenv/ruby-build/wiki#ubuntudebianmint
apt_package %w(autoconf patch build-essential rustc libssl-dev libyaml-dev libreadline6-dev zlib1g-dev libgmp-dev libncurses5-dev libffi-dev libgdbm6 libgdbm-dev libdb-dev uuid-dev)

execute 'install ruby with ruby build' do
  # Target /usr/local; it might make sense to install ruby itself to /usr as
  # our old apt approach did, but the directory we target here is also the one
  # RubyGems will target, and local is more appropriate for that installation
  command "ruby-build #{node['cdo-ruby']['version']} /usr/local"

  # Only actually execute this if there's a change to either the install
  # directory or the version of ruby that we're trying to install
  not_if "(which ruby | grep --quiet --fixed-strings '/usr/local/bin/ruby') && (ruby --version | grep --quiet '^ruby #{node['cdo-ruby']['version']}')"
end
