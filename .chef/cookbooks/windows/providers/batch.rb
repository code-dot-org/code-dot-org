#
# Author:: Seth Chisamore (<schisamo@chef.io>)
# Cookbook Name:: windws
# Provider:: batch
#
# Copyright:: 2011-2015, Chef Software, Inc.
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
use_inline_resources if defined?(use_inline_resources)

require 'tempfile'
require 'chef/resource/execute'

action :run do
  begin
    script_file.puts(@new_resource.code)
    script_file.close
    set_owner_and_group

    # cwd hax...shell_out on windows needs to support proper 'cwd'
    # follow CHEF-2357 for more
    cwd = @new_resource.cwd ? "cd \"#{@new_resource.cwd}\" & " : ''

    execute @new_resource.name do
      action  :run
      command "#{cwd}call \"#{script_file.path}\" #{@new_resource.flags}"
      user    @new_resource.user unless @new_resource.user.nil?
      group   @new_resource.group unless @new_resource.group.nil?
      creates @new_resource.creates unless @new_resource.creates.nil?
      returns @new_resource.returns unless @new_resource.returns.nil?
    end
  ensure
    unlink_script_file
  end
end

private

def set_owner_and_group
  # FileUtils itself implements a no-op if +user+ or +group+ are nil
  # You can prove this by running FileUtils.chown(nil,nil,'/tmp/file')
  # as an unprivileged user.
  FileUtils.chown(@new_resource.user, @new_resource.group, script_file.path)
end

def script_file
  @script_file ||= Tempfile.open(['chef-script', '.bat'])
end

def unlink_script_file
  @script_file && @script_file.close!
end
