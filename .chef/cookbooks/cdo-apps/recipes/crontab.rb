# Manages the user crontab for scheduled apps-related tasks.

template "/home/#{node[:current_user]}/#{node.chef_environment}/crontab" do
  source 'crontab.erb'
  user node[:current_user]
  group node[:current_user]
  mode '0644'
  notifies :run, 'execute[install-crontab]', :immediately
end

execute 'install-crontab' do
  command 'cat ./crontab | crontab -'
  cwd "/home/#{node[:current_user]}/#{node.chef_environment}"
  user node[:current_user]
  group node[:current_user]
  action :nothing
end
