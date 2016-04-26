#
# Cookbook Name:: omnibus_updater
# Attributes:: default
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

default[:omnibus_updater][:version] = nil
default[:omnibus_updater][:force_latest] = false
default[:omnibus_updater][:remove_chef_system_gem] = false
default[:omnibus_updater][:prerelease] = false
default[:omnibus_updater][:disabled] = false
default[:omnibus_updater][:kill_chef_on_upgrade] = true
default[:omnibus_updater][:upgrade_notification] = :immediately
# Default to 'kill' for long-running, interval-based chef-client
# Default to 'exec' for local-mode and single-run chef-client
default[:omnibus_updater][:upgrade_behavior] =
  Chef::Config[:interval] ? 'kill' : 'exec'
default[:omnibus_updater][:exec_command] = $0.split(' ').first
default[:omnibus_updater][:exec_args] = ARGV
default[:omnibus_updater][:prevent_downgrade] = false
default[:omnibus_updater][:restart_chef_service] = false
