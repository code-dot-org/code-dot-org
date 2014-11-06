apt_package "varnish"

template '/etc/default/varnish' do
  source 'varnish_config.erb'
  user 'root'
  group 'root'
  mode '0644'
end

template '/etc/varnish/default.vcl' do
  source 'varnish_vcl.erb'
  user 'root'
  group 'root'
  mode '0644'
end

template '/etc/varnish/secret' do
  source 'varnish_secret.erb'
  user 'root'
  group 'root'
  mode '0600'
end

service "varnish" do
  action [:enable, :start]
end
