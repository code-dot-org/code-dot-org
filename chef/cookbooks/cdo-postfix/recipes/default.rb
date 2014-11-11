#
# Cookbook Name:: cdo-postfix
# Recipe:: default
#

apt_package "postfix"
apt_package "libsasl2-2"
apt_package "libsasl2-modules"
apt_package "sasl2-bin"

service "postfix" do
  action :nothing
end

directory "/etc/postfix" do
  owner "postfix"
  group "postfix"
  mode "0755"
  action :create
end

[
  "dynamicmaps.cf",
  "main.cf",
  "master.cf",
  "postfix-files",
  "sasl_password",
  "sasl_password.db",
  "virtual",
  "virtual.db",
].each do |file|
  cookbook_file "/etc/postfix/#{file}" do
    source file
    owner "postfix"
    group "postfix"
    mode "0644"
    notifies :restart, "service[postfix]"
  end
end

[
  "post-install",
  "postfix-script",
].each do |file|
  cookbook_file "/etc/postfix/#{file}" do
    source file
    owner "postfix"
    group "postfix"
    mode "0755"
    notifies :restart, "service[postfix]"
  end
end

[
  "mailname",
  "aliases",
  "aliases.db",
].each do |file|
  cookbook_file "/etc/#{file}" do
    source file
    owner "postfix"
    group "postfix"
    mode "0644"
    notifies :restart, "service[postfix]"
  end
end

service "postfix" do
  action [:enable, :start]
end
