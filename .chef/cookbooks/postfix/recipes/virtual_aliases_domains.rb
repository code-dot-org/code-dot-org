# encoding: utf-8
# Copyright:: Copyright (c) 2012, Chef Software, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

include_recipe 'postfix::_common'

execute 'update-postfix-virtual-alias-domains' do
  command "postmap #{node['postfix']['virtual_alias_domains_db']}"
  environment PATH: "#{ENV['PATH']}:/opt/omni/bin:/opt/omni/sbin" if platform_family?('omnios')
  action :nothing
end

template node['postfix']['virtual_alias_domains_db'] do
  source 'virtual_aliases_domains.erb'
  notifies :run, 'execute[update-postfix-virtual-alias-domains]'
  notifies :restart, 'service[postfix]'
end
