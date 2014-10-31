directory "/home/#{node[:current_user]}/#{node[:environment]}/aws/secrets" do
  mode '0755'
  recursive true
end

template "/home/#{node[:current_user]}/#{node[:environment]}/aws/secrets/config.yml" do
  source 'config.yml.erb'
  mode '0644'
end
