# encoding: utf-8
# Author:: Joshua Timberman(<joshua@chef.io>)
# Cookbook Name:: postfix
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

include_recipe 'postfix::_common'

if node['postfix']['main']['smtp_sasl_auth_enable'] == 'yes'
  include_recipe 'postfix::sasl_auth'
end

if node['postfix']['use_alias_maps']
  include_recipe 'postfix::aliases'
end

if node['postfix']['use_transport_maps']
  include_recipe 'postfix::transports'
end

if node['postfix']['use_access_maps']
  include_recipe 'postfix::access'
end

if node['postfix']['use_virtual_aliases']
  include_recipe 'postfix::virtual_aliases'
end

if node['postfix']['use_virtual_aliases_domains']
  include_recipe 'postfix::virtual_aliases_domains'
end

if node['postfix']['use_relay_restrictions_maps']
  include_recipe 'postfix::relay_restrictions'
end

