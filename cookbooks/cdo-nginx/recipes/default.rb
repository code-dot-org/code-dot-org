apt_repository 'nginx' do
  uri          'ppa:nginx/development'
  distribution 'trusty'
end

apt_package 'nginx'

directory '/run/unicorn' do
  user node[:current_user]
end

template '/etc/nginx/nginx.conf' do
  source 'nginx.conf.erb'
  user 'root'
  group 'root'
  mode '0644'
  notifies :restart, 'service[nginx]', :delayed
end

service 'nginx' do
  supports restart: true, reload: true, status: true
  action [:enable, :start]
end
