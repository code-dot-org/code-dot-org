#
# Cookbook Name:: cdo-varnish
# Recipe:: default
#

# Varnish 4.0 vmods from PPA.
apt_repository 'varnish-4.0-vmods' do
  uri          'ppa:wjordan/varnish-vmods'
  distribution 'trusty'
end

apt_package 'varnish' do
  version '4.0.3-1~trusty'
  options '--force-yes'
  # Overwrite existing config files on upgrade (templates will be reapplied afterwards)
  options '-o Dpkg::Options::="--force-confnew"'
end
apt_package 'libvmod-cookie' do
  version '1.03+4.0.3-5~trusty'
  options '--force-yes'
end
apt_package 'libvmod-header' do
  version '0.3+4.0.3-1~trusty'
  options '--force-yes'
end

service 'varnish' do
  action :nothing
end

node.default['cdo-varnish']['config'] = HttpCache.config(node.chef_environment.to_s)
$node_env = node.chef_environment.to_s
$node_name = node.name

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

template '/etc/default/varnish' do
  source 'config.erb'
  user 'root'
  group 'root'
  mode '0644'
  notifies :restart, 'service[varnish]', :delayed
end

template '/etc/varnish/accept-language.vcl' do
  source 'accept-language.vcl.erb'
  user 'root'
  group 'root'
  mode '0644'
  notifies :reload, 'service[varnish]', :delayed
end

template '/etc/varnish/default.vcl' do
  source 'default.vcl.erb'
  user 'root'
  group 'root'
  mode '0644'
  notifies :reload, 'service[varnish]', :delayed
end

template '/etc/varnish/secret' do
  source 'secret.erb'
  user 'root'
  group 'root'
  mode '0600'
  notifies :reload, 'service[varnish]', :delayed
end

service "varnish" do
  supports restart: true, reload: true, status: true
  action [:enable, :start]
end
