#
# Cookbook Name:: ark
# Provider:: Ark
#
# Author:: Bryan W. Berry <bryan.berry@gmail.com>
# Author:: Sean OMeara <someara@chef.io
# Author:: John Bellone <jbellone@bloomberg.net>
# Copyright 2012, Bryan W. Berry
# Copyright 2013, Chef Software, Inc.
# Copyright 2014, Bloomberg L.P.
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

use_inline_resources
include ::Ark::ProviderHelpers

#################
# action :install
#################
action :install do
  show_deprecations
  set_paths

  directory new_resource.path do
    recursive true
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  remote_file new_resource.release_file do
    Chef::Log.debug('DEBUG: new_resource.release_file')
    source new_resource.url
    checksum new_resource.checksum if new_resource.checksum
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  # unpack based on file extension
  execute "unpack #{new_resource.release_file}" do
    command unpack_command
    cwd new_resource.path
    environment new_resource.environment
    notifies :run, "execute[set owner on #{new_resource.path}]"
    action :nothing
  end

  # set_owner
  execute "set owner on #{new_resource.path}" do
    command owner_command
    action :nothing
  end

  # usually on windows there is no central directory with executables where the applciations are linked
  unless node['platform_family'] == 'windows'
    # symlink binaries
    new_resource.has_binaries.each do |bin|
      link ::File.join(new_resource.prefix_bin, ::File.basename(bin)) do
        to ::File.join(new_resource.path, bin)
      end
    end

    # action_link_paths
    link new_resource.home_dir do
      to new_resource.path
    end

    # Add to path for interactive bash sessions
    template "/etc/profile.d/#{new_resource.name}.sh" do
      cookbook 'ark'
      source 'add_to_path.sh.erb'
      owner 'root'
      group 'root'
      mode '0755'
      cookbook 'ark'
      variables(directory: "#{new_resource.path}/bin")
      only_if { new_resource.append_env_path }
    end
  end

  # Add to path for the current chef-client converge.
  bin_path = ::File.join(new_resource.path, 'bin')
  ruby_block "adding '#{bin_path}' to chef-client ENV['PATH']" do
    block do
      ENV['PATH'] = bin_path + ':' + ENV['PATH']
    end
    only_if do
      new_resource.append_env_path && ENV['PATH'].scan(bin_path).empty?
    end
  end
end

##############
# action :put
##############
action :put do
  show_deprecations
  set_put_paths

  directory new_resource.path do
    recursive true
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  # download
  remote_file new_resource.release_file do
    source new_resource.url
    checksum new_resource.checksum if new_resource.checksum
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  # unpack based on file extension
  execute "unpack #{new_resource.release_file}" do
    command unpack_command
    cwd new_resource.path
    environment new_resource.environment
    notifies :run, "execute[set owner on #{new_resource.path}]"
    action :nothing
  end

  # set_owner
  execute "set owner on #{new_resource.path}" do
    command owner_command
    action :nothing
  end
end

###########################
# action :dump
###########################
action :dump do
  show_deprecations
  set_dump_paths

  directory new_resource.path do
    recursive true
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  # download
  remote_file new_resource.release_file do
    Chef::Log.debug("DEBUG: new_resource.release_file #{new_resource.release_file}")
    source new_resource.url
    checksum new_resource.checksum if new_resource.checksum
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  # unpack based on file extension
  execute "unpack #{new_resource.release_file}" do
    command dump_command
    cwd new_resource.path
    environment new_resource.environment
    notifies :run, "execute[set owner on #{new_resource.path}]"
    action :nothing
  end

  # set_owner
  execute "set owner on #{new_resource.path}" do
    command owner_command
    action :nothing
  end
end

###########################
# action :unzip
###########################
action :unzip do
  show_deprecations
  set_dump_paths

  directory new_resource.path do
    recursive true
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  # download
  remote_file new_resource.release_file do
    Chef::Log.debug("DEBUG: new_resource.release_file #{new_resource.release_file}")
    source new_resource.url
    checksum new_resource.checksum if new_resource.checksum
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  # unpack based on file extension
  execute "unpack #{new_resource.release_file}" do
    command unzip_command
    cwd new_resource.path
    environment new_resource.environment
    notifies :run, "execute[set owner on #{new_resource.path}]"
    action :nothing
  end

  # set_owner
  execute "set owner on #{new_resource.path}" do
    command owner_command
    action :nothing
  end
end

#####################
# action :cherry_pick
#####################
action :cherry_pick do
  show_deprecations
  set_dump_paths
  Chef::Log.debug("DEBUG: new_resource.creates #{new_resource.creates}")

  directory new_resource.path do
    recursive true
    action :create
    notifies :run, "execute[cherry_pick #{new_resource.creates} from #{new_resource.release_file}]"
  end

  # download
  remote_file new_resource.release_file do
    source new_resource.url
    checksum new_resource.checksum if new_resource.checksum
    action :create
    notifies :run, "execute[cherry_pick #{new_resource.creates} from #{new_resource.release_file}]"
  end

  execute "cherry_pick #{new_resource.creates} from #{new_resource.release_file}" do
    command cherry_pick_command
    creates "#{new_resource.path}/#{new_resource.creates}"
    notifies :run, "execute[set owner on #{new_resource.path}]"
    action :nothing
  end

  # set_owner
  execute "set owner on #{new_resource.path}" do
    command owner_command
    action :nothing
  end
end

###########################
# action :install_with_make
###########################
action :install_with_make do
  show_deprecations
  set_paths

  directory new_resource.path do
    recursive true
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  remote_file new_resource.release_file do
    Chef::Log.debug('DEBUG: new_resource.release_file')
    source new_resource.url
    checksum new_resource.checksum if new_resource.checksum
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  # unpack based on file extension
  execute "unpack #{new_resource.release_file}" do
    command unpack_command
    cwd new_resource.path
    environment new_resource.environment
    notifies :run, "execute[set owner on #{new_resource.path}]"
    notifies :run, "execute[autogen #{new_resource.path}]"
    notifies :run, "execute[configure #{new_resource.path}]"
    notifies :run, "execute[make #{new_resource.path}]"
    notifies :run, "execute[make install #{new_resource.path}]"
    action :nothing
  end

  # set_owner
  execute "set owner on #{new_resource.path}" do
    command owner_command
    action :nothing
  end

  execute "autogen #{new_resource.path}" do
    command './autogen.sh'
    only_if { ::File.exist? "#{new_resource.path}/autogen.sh" }
    cwd new_resource.path
    environment new_resource.environment
    action :nothing
    ignore_failure true
  end

  execute "configure #{new_resource.path}" do
    command "./configure #{new_resource.autoconf_opts.join(' ')}"
    only_if { ::File.exist? "#{new_resource.path}/configure" }
    cwd new_resource.path
    environment new_resource.environment
    action :nothing
  end

  execute "make #{new_resource.path}" do
    command "make #{new_resource.make_opts.join(' ')}"
    cwd new_resource.path
    environment new_resource.environment
    action :nothing
  end

  execute "make install #{new_resource.path}" do
    command "make install #{new_resource.make_opts.join(' ')}"
    cwd new_resource.path
    environment new_resource.environment
    action :nothing
  end
end

action :setup_py_build do
  show_deprecations
  set_paths

  directory new_resource.path do
    recursive true
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  remote_file new_resource.release_file do
    Chef::Log.debug('DEBUG: new_resource.release_file')
    source new_resource.url
    checksum new_resource.checksum if new_resource.checksum
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  # unpack based on file extension
  execute "unpack #{new_resource.release_file}" do
    command unpack_command
    cwd new_resource.path
    environment new_resource.environment
    notifies :run, "execute[set owner on #{new_resource.path}]"
    notifies :run, "execute[python setup.py build #{new_resource.path}]"
    action :nothing
  end

  # set_owner
  execute "set owner on #{new_resource.path}" do
    command owner_command
    action :nothing
  end

  execute "python setup.py build #{new_resource.path}" do
    command "python setup.py build #{new_resource.make_opts.join(' ')}"
    cwd new_resource.path
    environment new_resource.environment
    action :nothing
  end
end

action :setup_py_install do
  show_deprecations
  set_paths

  directory new_resource.path do
    recursive true
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  remote_file new_resource.release_file do
    Chef::Log.debug('DEBUG: new_resource.release_file')
    source new_resource.url
    checksum new_resource.checksum if new_resource.checksum
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  # unpack based on file extension
  execute "unpack #{new_resource.release_file}" do
    command unpack_command
    cwd new_resource.path
    environment new_resource.environment
    notifies :run, "execute[set owner on #{new_resource.path}]"
    notifies :run, "execute[python setup.py install #{new_resource.path}]"
    action :nothing
  end

  # set_owner
  execute "set owner on #{new_resource.path}" do
    command owner_command
    action :nothing
  end

  execute "python setup.py install #{new_resource.path}" do
    command "python setup.py install #{new_resource.make_opts.join(' ')}"
    cwd new_resource.path
    environment new_resource.environment
    action :nothing
  end
end

action :setup_py do
  show_deprecations
  set_paths

  directory new_resource.path do
    recursive true
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  remote_file new_resource.release_file do
    Chef::Log.debug('DEBUG: new_resource.release_file')
    source new_resource.url
    checksum new_resource.checksum if new_resource.checksum
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  # unpack based on file extension
  execute "unpack #{new_resource.release_file}" do
    command unpack_command
    cwd new_resource.path
    environment new_resource.environment
    notifies :run, "execute[set owner on #{new_resource.path}]"
    notifies :run, "execute[python setup.py #{new_resource.path}]"
    action :nothing
  end

  # set_owner
  execute "set owner on #{new_resource.path}" do
    command owner_command
    action :nothing
  end

  execute "python setup.py #{new_resource.path}" do
    command "python setup.py #{new_resource.make_opts.join(' ')}"
    cwd new_resource.path
    environment new_resource.environment
    action :nothing
  end
end

action :configure do
  show_deprecations
  set_paths

  directory new_resource.path do
    recursive true
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  remote_file new_resource.release_file do
    Chef::Log.debug('DEBUG: new_resource.release_file')
    source new_resource.url
    checksum new_resource.checksum if new_resource.checksum
    action :create
    notifies :run, "execute[unpack #{new_resource.release_file}]"
  end

  # unpack based on file extension
  execute "unpack #{new_resource.release_file}" do
    command unpack_command
    cwd new_resource.path
    environment new_resource.environment
    notifies :run, "execute[set owner on #{new_resource.path}]"
    notifies :run, "execute[autogen #{new_resource.path}]"
    notifies :run, "execute[configure #{new_resource.path}]"
    action :nothing
  end

  # set_owner
  execute "set owner on #{new_resource.path}" do
    command owner_command
    action :nothing
  end

  execute "autogen #{new_resource.path}" do
    command './autogen.sh'
    only_if { ::File.exist? "#{new_resource.path}/autogen.sh" }
    cwd new_resource.path
    environment new_resource.environment
    action :nothing
    ignore_failure true
  end

  execute "configure #{new_resource.path}" do
    command "./configure #{new_resource.autoconf_opts.join(' ')}"
    only_if { ::File.exist? "#{new_resource.path}/configure" }
    cwd new_resource.path
    environment new_resource.environment
    action :nothing
  end
end
