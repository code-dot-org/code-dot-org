#
# Author:: Joshua Timberman (<jtimberman@chef.io>)
# Author:: Graeme Mathieson (<mathie@woss.name>)
# Cookbook Name:: homebrew
# Providers:: tap
#
# Copyright 2011-2015, Chef Software, Inc.
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

include ::Homebrew::Mixin

use_inline_resources

def load_current_resource
  @tap = Chef::Resource::HomebrewTap.new(new_resource.name)
  tap_dir = @tap.name.gsub('/', '/homebrew-')

  Chef::Log.debug("Checking whether we've already tapped #{new_resource.name}")
  if ::File.directory?("/usr/local/Library/Taps/#{tap_dir}")
    @tap.tapped true
  else
    @tap.tapped false
  end
end

action :tap do
  unless @tap.tapped
    execute "tapping #{new_resource.name}" do
      command "/usr/local/bin/brew tap #{new_resource.name}"
      environment lazy { { 'HOME' => ::Dir.home(homebrew_owner), 'USER' => homebrew_owner } }
      not_if "/usr/local/bin/brew tap | grep #{new_resource.name}"
      user homebrew_owner
    end
  end
end

action :untap do
  if @tap.tapped
    execute "untapping #{new_resource.name}" do
      command "/usr/local/bin/brew untap #{new_resource.name}"
      environment lazy { { 'HOME' => ::Dir.home(homebrew_owner), 'USER' => homebrew_owner } }
      only_if "/usr/local/bin/brew tap | grep #{new_resource.name}"
      user homebrew_owner
    end
  end
end
