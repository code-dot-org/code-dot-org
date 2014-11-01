directory "/home/#{node[:current_user]}/#{node[:environment]}/aws/secrets" do
  mode '0755'
  recursive true
end

template "/home/#{node[:current_user]}/#{node[:environment]}/aws/secrets/words.csv" do
  source 'words.csv.erb'
  mode '0644'
end
