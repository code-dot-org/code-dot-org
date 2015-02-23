directory "/home/#{node[:current_user]}/.ssh" do
  mode '0700'
end

template "/home/#{node[:current_user]}/.ssh/authorized_keys" do
  source 'authorized_keys.erb'
  mode '0600'
end
