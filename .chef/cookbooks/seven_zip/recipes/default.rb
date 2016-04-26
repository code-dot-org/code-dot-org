#
# Author:: Seth Chisamore (<schisamo@chef.io>)
# Cookbook Name:: seven_zip
# Recipe:: default
#
# Copyright 2011-2016, Chef Software, Inc.
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

windows_package node['seven_zip']['package_name'] do
  source node['seven_zip']['url']
  checksum node['seven_zip']['checksum']
  options "INSTALLDIR=\"#{node['seven_zip']['home']}\"" if node['seven_zip']['home']
  action :install
end

# update path
windows_path 'seven_zip' do
  path lazy {
    if node['seven_zip']['home']
      node['seven_zip']['home']
    else
      ::Win32::Registry::HKEY_LOCAL_MACHINE.open(
        'SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\7zFM.exe',
        ::Win32::Registry::KEY_READ).read_s('Path')
    end
  }
  action :add
end if node['seven_zip']['syspath']
