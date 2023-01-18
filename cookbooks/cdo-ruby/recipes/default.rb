# Install Ruby via ruby-build, as recommended by Ruby docs
#
# https://www.ruby-lang.org/en/documentation/installation/#ruby-build
# https://github.com/rbenv/ruby-build#readme

# Arbitrarily use the latest version of ruby build at time this code was
# written; this probably doesn't matter, but we need to pick something.
RUBY_BUILD_VERSION = '20221225'.freeze

remote_file '/tmp/ruby-build.tar.gz' do
  source "https://github.com/rbenv/ruby-build/archive/refs/tags/v#{RUBY_BUILD_VERSION}.tar.gz"
end

archive_file '/tmp/ruby-build.tar.gz' do
  destination '/tmp/ruby-build'
end

execute 'install ruby-build' do
  cwd "/tmp/ruby-build/ruby-build-#{RUBY_BUILD_VERSION}"
  command './install.sh'
end

execute 'install ruby with ruby build' do
  # target /usr specifically because that's where our old apt approach
  # installed ruby; could instead consider /usr/local if we figure out a good
  # way to clean up existing installations.
  command "ruby-build #{node['cdo-ruby']['version']} /usr"
end

# TODO: Remove old Ruby version packages if present.

# Install Ruby Tools and Dependencies

cookbook_file '/etc/gemrc' do
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

# Install rake
gem_package 'rake' do
  action :upgrade
  version node['cdo-ruby']['rake_version']
end

# git is required for using git repos with bundler
apt_package 'git'

gem_package 'bundler' do
  action :upgrade
  version node['cdo-ruby']['bundler_version']
end

template "#{node[:home]}/.gemrc" do
  source 'gemrc.erb'
  user node[:user]
  group node[:user]
end
