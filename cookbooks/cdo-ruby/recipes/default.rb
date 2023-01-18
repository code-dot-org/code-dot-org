# Install Ruby, based on documentation at https://www.ruby-lang.org/en/documentation/installation/#building-from-source
ruby_snapshot = "snapshot-ruby_#{node['cdo-ruby']['version'].tr('.', '_')}"
remote_file "/tmp/#{ruby_snapshot}.tar.gz" do
  source "https://cache.ruby-lang.org/pub/ruby/snapshot/#{ruby_snapshot}.tar.gz"
end

archive_file "/tmp/#{ruby_snapshot}.tar.gz" do
  destination '/tmp/ruby_snapshot'
end

execute "Build Ruby #{node['cdo-ruby']['version']} from Source" do
  cwd "/tmp/ruby_snapshot/#{ruby_snapshot}"
  command './configure && make && make install'
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
