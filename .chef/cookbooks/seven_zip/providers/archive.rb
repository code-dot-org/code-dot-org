#
# Author:: Shawn Neal (<sneal@sneal.net>)
# Cookbook Name:: seven_zip
# Provider:: archive
#
# Copyright:: 2013, Daptiv Solutions LLC
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

require 'fileutils'
require 'chef/mixin/shell_out'

include Chef::Mixin::ShellOut
include Windows::Helper

def whyrun_supported?
  true
end

use_inline_resources

action :extract do
  converge_by("Extract #{@new_resource.source} => #{@new_resource.path} (overwrite=#{@new_resource.overwrite})") do
    FileUtils.mkdir_p(@new_resource.path) unless Dir.exist?(@new_resource.path)
    local_source = cached_file(@new_resource.source, @new_resource.checksum)
    cmd = "\"#{seven_zip_exe}\" x"
    cmd << ' -y' if @new_resource.overwrite
    cmd << " -o#{win_friendly_path(@new_resource.path)}"
    cmd << " #{local_source}"
    Chef::Log.debug(cmd)
    shell_out!(cmd)
  end
end

def seven_zip_exe
  path = if node['seven_zip']['home']
           # If the installation home is specifically set, use it
           node['seven_zip']['home']
         else
           require 'win32/registry'
           # Read path from recommended Windows App Paths registry location
           # docs: https://msdn.microsoft.com/en-us/library/windows/desktop/ee872121
           ::Win32::Registry::HKEY_LOCAL_MACHINE.open(
             'SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\7zFM.exe',
             ::Win32::Registry::KEY_READ).read_s('Path')
         end
  Chef::Log.debug("Using 7-zip home: #{path}")
  win_friendly_path(::File.join(path, '7z.exe'))
end
