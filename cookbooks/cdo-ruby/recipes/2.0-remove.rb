# Uninstall Ruby 2.0.

%w(ruby2.0-dev ruby2.0 rake).each do |pkg|
  apt_package pkg do
    action :purge
    notifies :run, 'execute[apt-get autoremove]', :immediately
  end
end

ruby_resource = 'apt_package[ruby2.0]'

# Clean up manually-installed symlinks.
%w(ruby irb rdoc erb gem).each do |ruby_link|
  link "/usr/bin/#{ruby_link}" do
    to "/usr/bin/#{ruby_link}2.0"
    action :nothing
    subscribes :delete, ruby_resource, :immediately
  end
end

# Clean up after RubyGems bug.
require 'etc'
home = Etc.getpwnam(Etc.getlogin).dir
directory "#{home}/.gem" do
  recursive true
  action :nothing
  subscribes :delete, ruby_resource, :immediately
end
