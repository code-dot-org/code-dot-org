include_recipe 'cdo-nginx'
include_recipe 'cdo-ruby'

# Set up a minimal test Rackup app
file '/home/kitchen/config.ru' do
  content <<RUBY
class HelloWorld
  def self.call(env)
    [200, {"Content-Type" => "text/plain"}, ["Hello world!"]]
  end
end
run HelloWorld
RUBY
end

# Install Unicorn and configure as a service

file '/home/kitchen/unicorn.rb' do
  content <<RUBY
listen '/run/unicorn/dashboard.sock'
worker_processes 1
pid "/home/kitchen/dashboard.pid"
timeout 60
preload_app true
stderr_path '/home/kitchen/dashboard_unicorn_stderr.log'
stdout_path '/home/kitchen/dashboard_unicorn_stdout.log'
working_directory '/home/kitchen'
RUBY
end

template "/etc/init.d/nginx_test" do
  source 'unicorn.sh.erb'
  mode '0755'
  variables src_file: "/home/#{node[:current_user]}/unicorn.rb",
    app_root: "/home/#{node[:current_user]}",
    pid_file: "/home/#{node[:current_user]}/dashboard.pid",
    user: node[:current_user],
    env: node.chef_environment
end

file '/home/kitchen/Gemfile' do
  content <<RUBY
source 'https://rubygems.org'
gem 'unicorn', '~> 4.8.2'
RUBY
end

execute "bundle install" do
  cwd "/home/#{node[:current_user]}"
end

service 'nginx_test' do
  supports reload: true
  reload_command 'sudo /etc/init.d/nginx_test upgrade'
  action [:enable, :start]
end
