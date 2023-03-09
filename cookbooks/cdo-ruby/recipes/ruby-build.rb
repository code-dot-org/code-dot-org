# Install Ruby via ruby-build, as recommended by Ruby docs
#
# Based on instructions at:
#   https://www.ruby-lang.org/en/documentation/installation/#ruby-build
#   https://github.com/rbenv/ruby-build#readme

# Remove old Ruby version packages if present.
# TODO: remove this (and the old_version attribute) once all existing servers
# have been updated
if (old = node['cdo-ruby']['old_version'])
  include_recipe 'apt'
  %W[
    ruby#{old}-dev
    ruby#{old}
  ].each do |pkg|
    apt_package pkg do
      action :purge
      notifies :run, 'execute[apt-get autoremove]', :immediately
    end
  end
end

# Arbitrarily use the latest version of ruby build at time this code was
# written; this probably doesn't matter, but we need to pick something.
RUBY_BUILD_VERSION = '20221225'.freeze

remote_file '/tmp/ruby-build.tar.gz' do
  source "https://github.com/rbenv/ruby-build/archive/refs/tags/v#{RUBY_BUILD_VERSION}.tar.gz"
end

archive_file '/tmp/ruby-build.tar.gz' do
  destination '/tmp/ruby-build'
  overwrite :auto
end

execute 'install ruby-build' do
  cwd "/tmp/ruby-build/ruby-build-#{RUBY_BUILD_VERSION}"
  command './install.sh'
  not_if "which ruby-build && ruby-build --version | grep --quiet --fixed-strings 'ruby-build #{RUBY_BUILD_VERSION}'"
end

execute 'install ruby with ruby build' do
  # Target /usr/local; it might make sense to install ruby itself to /usr, but
  # the directory we target here is also the one RubyGems will target for its
  # own installation and local is more appropriate for that content.
  command "ruby-build #{node['cdo-ruby']['version']} /usr/local"
  not_if "which ruby && ruby --version | grep --quiet '^ruby #{node['cdo-ruby']['version']}'"
end
