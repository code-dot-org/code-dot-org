apt_repository 'nginx' do
  uri          'ppa:nginx/development'
  distribution 'trusty'
end

apt_package 'nginx'

run_unicorn = '/run/unicorn'
directory run_unicorn do
  user node[:current_user]
  group node[:current_user]
  # Ensure directory is created before app-services are (re)loaded.
  %w(dashboard pegasus).each do |app|
    subscribes :create, "service[#{app}]", :before
    # App service may be initially loaded within Rake-build resource.
    subscribes :create, "execute[build-#{app}]", :before
  end
end

%w(dashboard pegasus).each do |app|
  socket_path = File.join run_unicorn, "#{app}.sock"
  file socket_path do
    action :delete
    not_if { ::File.socket?(socket_path) }
  end
  node.override['cdo-secrets']["#{app}_sock"] = socket_path
end

# Get/create the SSL cert via the `ssl_certificate` cookbook resource, if provided.
# Otherwise, create a self-signed certificate.
node.default['ssl_certificate']['service']['compatibility'] = 'modern'
ssl_cert_provided = node['cdo-nginx']['ssl_key']['content'] != '' &&
  node['cdo-nginx']['ssl_cert']['content'] != ''

cert = ssl_certificate 'cdo-nginx' do
  namespace node['cdo-nginx']
  if ssl_cert_provided
    chain_name 'cdo-chain'
    chain_source 'attribute'
    source 'attribute'
  end
  notifies :reload, 'service[nginx]'
end

template '/etc/nginx/nginx.conf' do
  source 'nginx.conf.erb'
  user 'root'
  group 'root'
  mode '0644'
  variables ssl_key: cert.key_path,
    ssl_cert: cert.chain_combined_path,
    run_dir: run_unicorn
  notifies :reload, 'service[nginx]', :immediately
end

service 'nginx' do
  supports restart: true, reload: true, status: true
  action [:enable, :start]

  # Ensure app services are updated to their current listener configuration before (re)starting nginx.
  %w(pegasus dashboard).each do |app|
    notifies :create, "file[#{app}_listeners]", :before
  end

  # Nginx upstart scripts are broken in Ubuntu 14.04, so force non-Upstart scripts.
  # Ref: https://bugs.launchpad.net/nginx/+bug/1476296
  provider Chef::Provider::Service::Debian
end
