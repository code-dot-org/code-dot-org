# encoding: utf-8
# Copyright:: Copyright 2012-2014, Chef Software, Inc.
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

execute 'update-postfix-aliases' do
  command 'newaliases'
  environment PATH: "#{ENV['PATH']}:/opt/omni/bin:/opt/omni/sbin" if platform_family?('omnios')
  # On FreeBSD, /usr/sbin/newaliases is the sendmail command, and it's in the path before postfix's /usr/local/bin/newaliases
  environment ({ 'PATH' => "/usr/local/bin:#{ENV['PATH']}" }) if platform_family?('freebsd')
  action :nothing
end

template node['postfix']['aliases_db'] do
  source 'aliases.erb'
  notifies :run, 'execute[update-postfix-aliases]'
end
