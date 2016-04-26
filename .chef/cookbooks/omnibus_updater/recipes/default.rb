#
# Cookbook Name:: omnibus_updater
# Recipe:: default
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

if(node[:omnibus_updater][:disabled])
  Chef::Log.warn 'Omnibus updater disabled via `disabled` attribute'
elsif(node[:platform] == 'debian' && Gem::Version.new(node[:platform_version]) < Gem::Version.new('6.0.0'))
  Chef::Log.warn 'Omnibus updater does not support Debian 5'
elsif(node[:platform] == 'raspbian')
  Chef::Log.warn 'Omnibus updater does not support Raspbian'
else
  include_recipe 'omnibus_updater::installer'
end

if(node[:omnibus_updater][:remove_chef_system_gem])
  include_recipe 'omnibus_updater::remove_chef_system_gem'
end
