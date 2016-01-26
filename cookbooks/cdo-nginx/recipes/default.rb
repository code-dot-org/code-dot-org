apt_repository 'nginx' do
  uri          'ppa:nginx/development'
  distribution 'trusty'
end

apt_package 'nginx'

directory '/run/unicorn' do
  user node[:current_user]
end

# Get/create the SSL cert via the `ssl_certificate` cookbook resource
node.default['ssl_certificate']['service']['compatibility'] = 'modern'
ssl = node['cdo-nginx']['ssl_key']['content'] != '' &&
  node['cdo-nginx']['ssl_cert']['content'] != ''

cert = ssl_certificate 'cdo-nginx' do
  namespace node['cdo-nginx']
  if ssl
    chain_name 'cdo-chain'
    chain_source 'attribute'
    source 'attribute'
  end
end

template '/etc/nginx/nginx.conf' do
  source 'nginx.conf.erb'
  user 'root'
  group 'root'
  mode '0644'
  variables ssl_key: cert.key_path,
    ssl_cert: cert.chain_combined_path
  notifies :reload, 'service[nginx]', :delayed
end

service 'nginx' do
  supports restart: true, reload: true, status: true
  restart_command 'service nginx restart'
  action [:enable, :start]
end
