template "#{node[:home]}/#{node.chef_environment}/dashboard/config/real_secret_words.csv" do
  source 'words.csv.erb'
  mode '0644'
  user node[:current_user]
  group node[:current_user]
end
