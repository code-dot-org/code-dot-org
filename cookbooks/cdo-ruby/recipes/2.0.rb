# Installs Ruby 2.0 using the default Ubuntu 14.04 packages.

include_recipe "build-essential"

apt_package "ruby2.0-dev"
apt_package "ruby2.0"
apt_package "rake"

link "/usr/bin/ruby" do
  to "/usr/bin/ruby2.0"
end

link "/usr/bin/irb" do
  to "/usr/bin/irb2.0"
end

link "/usr/bin/rdoc" do
  to "/usr/bin/rdoc2.0"
end

link "/usr/bin/erb" do
  to "/usr/bin/erb2.0"
end

link "/usr/bin/gem" do
  to "/usr/bin/gem2.0"
  notifies :run, "execute[update-system-gems]", :immediately
end

execute "update-system-gems" do
  command "gem update --system"
  action :nothing
  notifies :run, "execute[pristine-gems]", :immediately
end

execute "pristine-gems" do
  command "gem pristine --all"
  user "root"
  action :nothing
end

# Fix RubyGems bug that created ~/.gem with root permissions in the underlying user's home folder.
require 'etc'
user = Etc.getlogin
home = Etc.getpwnam(user).dir
directory "#{home}/.gem" do
  owner user
  group user
  recursive true
  only_if { File.directory?("#{home}/.gem") }
end
