#
# Cookbook Name:: cdo-varnish
# Recipe:: default
#
apt_package "varnish"

service "varnish" do
  action :nothing
end

template '/etc/default/varnish' do
  source 'config.erb'
  user 'root'
  group 'root'
  mode '0644'
  notifies :restart, "service[varnish]"
end

template '/etc/varnish/default.vcl' do
  source 'default.vcl.erb'
  user 'root'
  group 'root'
  mode '0644'
  notifies :restart, "service[varnish]"
end

template '/etc/varnish/secret' do
  source 'secret.erb'
  user 'root'
  group 'root'
  mode '0600'
  notifies :restart, "service[varnish]"
end

service "varnish" do
  action [:enable, :start]
end
