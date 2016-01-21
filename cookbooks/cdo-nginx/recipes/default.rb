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
  notifies :reload, 'service[nginx]', :delayed
end

service 'nginx' do
  supports restart: true, reload: true, status: true
  restart_command 'service nginx restart'
  action [:enable, :start]
end
