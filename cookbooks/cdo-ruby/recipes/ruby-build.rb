# Install Ruby via ruby-build, as recommended by Ruby docs
#
# Based on instructions at:
#   https://www.ruby-lang.org/en/documentation/installation/#ruby-build
#   https://github.com/rbenv/ruby-build#readme

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
  # target /usr for consistency; that's where our old apt approach targeted
  command "ruby-build #{node['cdo-ruby']['version']} /usr"
  not_if "which ruby && ruby --version | grep --quiet '^ruby #{node['cdo-ruby']['version']}'"
end
