#
# Cookbook Name:: omnibus_updater
# Recipe:: installer
#
# Copyright 2014, Heavy Water Ops, LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

include_recipe 'omnibus_updater'
include_recipe 'omnibus_updater::chef_killer'

chef_gem "mixlib-install" do
  version '0.8.0.alpha.6'
  compile_time false if respond_to?(:compile_time)
end

service 'chef-client' do
  action :nothing
end

version = node[:omnibus_updater][:force_latest] ? :latest :
  node[:omnibus_updater].fetch(:version, :latest)

execute "omnibus_install[v#{version}]" do
  command lazy { InstallHelper.install_command(version) }
  sensitive true if respond_to?(:sensitive)

  if node[:omnibus_updater][:restart_chef_service]
    notifies :restart, resources(:service => 'chef-client'), :immediately
  end
  if node[:omnibus_updater][:kill_chef_on_upgrade]
    notifies :create, resources(:ruby_block => 'omnibus chef killer'), node[:omnibus_updater][:upgrade_notification]
  end
  only_if { InstallHelper.update_needed?(version, node[:omnibus_updater][:prevent_downgrade]) }
end
