include_recipe 'cdo-nginx'
include_recipe 'cdo-ruby'

# Set up a minimal test Rackup app
file '/home/kitchen/config.ru' do
  content <<RB
class HelloWorld
  def self.call(env)
    [200, {"Content-Type" => "text/plain"}, ["Hello world!"]]
  end
end
run HelloWorld
RB
end

# Install Unicorn and configure as a service

cookbook_file '/home/kitchen/unicorn.rb' do
  source 'unicorn.rb'
end

template "/etc/init.d/dashboard" do
  source 'init.d.erb'
  mode '0755'
  variables src_file: "/home/#{node[:current_user]}/unicorn.rb",
    app_root: "/home/#{node[:current_user]}",
    pid_file: "/home/#{node[:current_user]}/dashboard.pid",
    user: node[:current_user],
    env: node.chef_environment
end

file '/home/kitchen/Gemfile' do
  content <<RB
source 'https://rubygems.org'
gem 'unicorn', '~> 4.8.2'
RB
end

execute "bundle install" do
  cwd "/home/#{node[:current_user]}"
end

service 'dashboard' do
  supports reload: true
  reload_command 'sudo /etc/init.d/dashboard upgrade'
  action [:enable, :start]
end
