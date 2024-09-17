# We had previously manually added a repository here to install nginx, but
# nginx is distributed by default in Ubuntu 20+ so we no longer need to do so.
# Instead, we remove that addition from any persistent managed servers which
# currently have it.
#
# TODO infra: remove this once all existing servers have been cleaned up.
apt_repository 'nginx' do
  action :remove
end

apt_package 'nginx'

%w(dashboard pegasus).each do |app|
  socket_path = File.join node['cdo-nginx']['socket_path'], "#{app}.sock"
  # Ensure stale socket-files are cleaned up
  # (in case OS doesn't automatically remove them, e.g., due to an aborted process)
  file socket_path do
    action :delete
    not_if {File.socket?(socket_path)}
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
    run_dir: node['cdo-nginx']['socket_path']
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
