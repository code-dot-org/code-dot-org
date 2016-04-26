#
# Author:: Joshua Timberman (<jtimberman@chef.io>)
# Author:: Graeme Mathieson (<mathie@woss.name>)
# Cookbook Name:: homebrew
# Attributes:: default
#
# Copyright 2011-2013, Chef Software, Inc.
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

default['homebrew']['owner'] = nil
default['homebrew']['auto-update'] = true
default['homebrew']['casks'] = []
default['homebrew']['formulas'] = node['homebrew']['formula'] || []
default['homebrew']['taps'] = []
default['homebrew']['installer']['url'] = 'https://raw.githubusercontent.com/Homebrew/install/master/install'
default['homebrew']['installer']['checksum'] = nil
