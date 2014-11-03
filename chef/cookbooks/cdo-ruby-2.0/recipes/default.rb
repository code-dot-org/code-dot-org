#
# Cookbook Name:: cdo-ruby-2.0
# Recipe:: default
#

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
  user "root"
  action :nothing
  notifies :run, "execute[pristine-gems]", :immediately
end

execute "pristine-gems" do
  command "gem pristine --all"
  user "root"
  action :nothing
end

gem_package "bundler"

# These packages are used by Gems we install via Bundler later.
apt_package 'libxslt1-dev'
apt_package 'libssl-dev'
apt_package 'zlib1g-dev'
apt_package 'imagemagick'
apt_package 'libmagickcore-dev'
apt_package 'libmagickwand-dev'
apt_package 'pdftk'
apt_package 'enscript'
