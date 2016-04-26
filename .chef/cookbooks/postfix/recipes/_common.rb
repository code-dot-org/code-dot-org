# encoding: utf-8
# Author:: Joshua Timberman(<joshua@chef.io>)
# Cookbook Name:: common
# Recipe:: default
#
# Copyright 2009-2014, Chef Software, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

include_recipe 'postfix::_attributes'

package 'postfix'

package 'procmail' if node['postfix']['use_procmail']

case node['platform_family']
when 'rhel', 'fedora'
  service 'sendmail' do
    action :nothing
  end

  execute 'switch_mailer_to_postfix' do
    command '/usr/sbin/alternatives --set mta /usr/sbin/sendmail.postfix'
    notifies :stop, 'service[sendmail]'
    notifies :start, 'service[postfix]'
    not_if '/usr/bin/test /etc/alternatives/mta -ef /usr/sbin/sendmail.postfix'
  end
when 'omnios'
  manifest_path = ::File.join(Chef::Config[:file_cache_path], 'manifest-postfix.xml')

  # we need to manage the postfix group and user
  # and then subscribe to the package install because it creates a
  # postdrop group and adds postfix user to it.
  group 'postfix' do
    append true
  end

  user 'postfix' do
    uid node['postfix']['uid']
    gid 'postfix'
    home '/var/spool/postfix'
    subscribes :manage, 'package[postfix]'
    notifies :run, 'execute[/opt/omni/sbin/postfix set-permissions]', :immediately
  end

  # we don't guard this because if the user creation was successful (or happened out of band), then this won't get executed when the action is :nothing.
  execute '/opt/omni/sbin/postfix set-permissions'

  template manifest_path  do
    source 'manifest-postfix.xml.erb'
    owner 'root'
    group node['root_group']
    mode '0644'
    notifies :run, 'execute[load postfix manifest]', :immediately
  end

  execute 'load postfix manifest' do
    action :nothing
    command "svccfg import #{manifest_path}"
    notifies :restart, 'service[postfix]'
  end
end

execute 'update-postfix-sender_canonical' do
  command "postmap #{node['postfix']['conf_dir']}/sender_canonical"
  action :nothing
end

unless node['postfix']['sender_canonical_map_entries'].empty?
  template "#{node['postfix']['conf_dir']}/sender_canonical" do
    owner 'root'
    group node['root_group']
    mode '0644'
    notifies :run, 'execute[update-postfix-sender_canonical]'
    notifies :reload, 'service[postfix]'
  end

  unless node['postfix']['main'].key?('sender_canonical_maps')
    node.set['postfix']['main']['sender_canonical_maps'] = "hash:#{node['postfix']['conf_dir']}/sender_canonical"
  end
end

execute 'update-postfix-smtp_generic' do
  command "postmap #{node['postfix']['conf_dir']}/smtp_generic"
  action :nothing
end

unless node['postfix']['smtp_generic_map_entries'].empty?
  template "#{node['postfix']['conf_dir']}/smtp_generic" do
    owner 'root'
    group node['root_group']
    mode  '0644'
    notifies :run, 'execute[update-postfix-smtp_generic]'
    notifies :reload, 'service[postfix]'
  end

  unless node['postfix']['main'].key?('smtp_generic_maps')
    node.set['postfix']['main']['smtp_generic_maps'] = "hash:#{node['postfix']['conf_dir']}/smtp_generic"
  end
end

%w( main master ).each do |cfg|
  template "#{node['postfix']['conf_dir']}/#{cfg}.cf" do
    source "#{cfg}.cf.erb"
    owner 'root'
    group node['root_group']
    mode '0644'
    notifies :restart, 'service[postfix]'
    variables(settings: node['postfix'][cfg])
    cookbook node['postfix']["#{cfg}_template_source"]
  end
end

service 'postfix' do
  supports status: true, restart: true, reload: true
  action :enable
end
