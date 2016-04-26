# encoding: UTF-8
#
# Cookbook Name:: ssl_certificate
# Recipe:: attr_apply
# Author:: Stanislav Bogatyrev (<realloc@realloc.spb.ru>)
# Author:: Xabier de Zuazo (<xabier@zuazo.org>)
# Copyright:: Copyright (c) 2015 Onddo Labs, SL.
# License:: Apache License, Version 2.0
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

node['ssl_certificate']['items'].each do |item_hash|
  ssl_certificate item_hash[:name] do
    namespace item_hash
  end
end
