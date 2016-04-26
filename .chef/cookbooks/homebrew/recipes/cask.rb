#
# Cookbook Name:: homebrew
# Recipes:: cask
#
# Copyright 2014-2015, Chef Software, Inc <legal@chef.io>
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
Chef::Resource.send(:include, Homebrew::Mixin)

homebrew_tap 'caskroom/cask'

directory '/Library/Caches/Homebrew/Casks' do
  owner homebrew_owner
  mode 00775
  only_if { ::Dir.exist?('/Library/Caches/Homebrew') }
end

directory '/opt/homebrew-cask' do
  owner homebrew_owner
  mode 00775
  recursive true
end

directory '/opt/homebrew-cask/Caskroom' do
  owner homebrew_owner
  mode 00775
end
