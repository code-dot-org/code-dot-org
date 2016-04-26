#
# Cookbook Name:: omnibus_updater
# Recipe:: remove_chef_system_gem
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

gem_package 'chef' do
  action :purge
  only_if do
    Chef::Provider::Package::Rubygems.new(
      Chef::Resource::GemPackage.new('dummy_package')
    ).gem_env.gem_paths.detect{|path|
      path.start_with?('/opt/omnibus') || path.start_with?('/opt/chef')
    }.nil? && node[:omnibus_updater][:remove_chef_system_gem]
  end
end
