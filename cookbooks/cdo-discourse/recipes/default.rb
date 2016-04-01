# include_recipe 'cdo-postfix'

docker_service 'default' do
  action [:create, :start]
end

git '/var/discourse' do
  repository 'https://github.com/discourse/discourse_docker.git'
  revision 'a85e554333bffaac984eb585e25a74812982bfe6' # last updated 3/13/2016
  notifies :run, 'execute[launcher rebuild]'
end

template '/var/discourse/containers/app.yml' do
  source 'app.yml.erb'
  notifies :run, 'execute[launcher rebuild]'
end

execute 'launcher rebuild' do
  command './launcher rebuild app'
  cwd '/var/discourse'
  action :nothing
end
