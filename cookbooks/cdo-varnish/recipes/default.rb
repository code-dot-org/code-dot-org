#
# Cookbook Name:: cdo-varnish
# Recipe:: default
#

# Currently installing 5.2 since 6.x requires build varnish-modules from source:
# https://github.com/varnish/varnish-modules/issues/123
# TODO: upgrade to 6.x
apt_package 'varnish' do
  version '5.2.1-1'
  options '--force-yes'
  # Overwrite existing config files on upgrade (templates will be reapplied afterwards)
  options '-o Dpkg::Options::="--force-confnew"'
end

apt_package 'varnish-modules' do
  options '--force-yes'
end

# Needed to build libvmod-accept from source
apt_package %w(
  automake
  autotools-dev
  pkg-config
  libvarnishapi1
  libvarnishapi-dev
  libtool
  python-docutils
)

# Download, build, and install libvmod-accept from source
libvmod_accept_archive = "#{Chef::Config[:file_cache_path]}/libvmod-accept.tar.gz"
remote_file libvmod_accept_archive do
  source 'https://github.com/gquintard/libvmod-accept/tarball/5.2'
  action :create
end
ark 'libvmod-accept' do
  url "file://#{libvmod_accept_archive}"
  action :install_with_make
end

service 'varnish' do
  action :nothing
end

node.default['cdo-varnish']['config'] = HttpCache.config(node.chef_environment.to_s)
$node_env = node.chef_environment.to_s
$node_name = node.name
$override_dashboard = node['cdo-secrets'] && node['cdo-secrets']['override_dashboard']
$override_pegasus = node['cdo-secrets'] && node['cdo-secrets']['override_pegasus']

ruby_block 'update_service' do
  block do
    file = Chef::Util::FileEdit.new('/etc/init.d/varnish')
    %w(stop start).map do |cmd|
      file.search_file_replace(/(?<!--oknodo )--#{cmd}/, "--oknodo --#{cmd}")
    end
    file.write_file
  end
  subscribes :run, "service[varnish]", :before
end

systemd_varnish = '/etc/systemd/system/varnish.service.d'
directory systemd_varnish
template "#{systemd_varnish}/cdo.conf" do
  source 'varnish.service.erb'
  user 'root'
  group 'root'
  mode '0644'
  notifies :restart, 'service[varnish]', :delayed
end

template '/etc/varnish/default.vcl' do
  source 'default.vcl.erb'
  user 'root'
  group 'root'
  mode '0644'
  notifies :restart, 'service[varnish]', :delayed
end

template '/etc/varnish/secret' do
  source 'secret.erb'
  user 'root'
  group 'root'
  mode '0600'
  notifies :restart, 'service[varnish]', :delayed
end

service "varnish" do
  supports restart: true, reload: true, status: true
  action [:enable, :start]
end
