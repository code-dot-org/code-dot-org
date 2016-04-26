#
# Author:: Joshua Timberman (<jtimberman@chef.io>)
# Author:: Graeme Mathieson (<mathie@woss.name>)
# Cookbook Name:: homebrew
# Libraries:: homebrew_mixin
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
# Include the mixin from Chef 12 if its defined, when we get to the
# #homebrew_owner method below...
class Chef12HomebrewUser
  include Chef::Mixin::HomebrewUser if defined?(Chef::Mixin::HomebrewUser)
end

module Homebrew
  # Homebrew
  module Mixin
    def homebrew_owner
      if defined?(Chef::Mixin::HomebrewUser)
        begin
          require 'etc'
          @homebrew_owner ||= ::Etc.getpwuid(Chef12HomebrewUser.new.find_homebrew_uid).name
        rescue Chef::Exceptions::CannotDetermineHomebrewOwner
          @homebrew_owner ||= calculate_owner
        end
      else
        @homebrew_owner ||= calculate_owner
      end
    end

    private

    def calculate_owner
      owner = homebrew_owner_attr || sudo_user || current_user
      if owner == 'root'
        raise Chef::Exceptions::User,
             "Homebrew owner is 'root' which is not supported. " \
             "To set an explicit owner, please set node['homebrew']['owner']."
      end
      owner
    end

    def homebrew_owner_attr
      node['homebrew']['owner']
    end

    def sudo_user
      ENV['SUDO_USER']
    end

    def current_user
      ENV['USER']
    end
  end
end
