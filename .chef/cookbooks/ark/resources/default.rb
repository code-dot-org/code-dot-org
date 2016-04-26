#
# Cookbook Name:: ark
# Resource:: Ark
#
# Author:: Bryan W. Berry <bryan.berry@gmail.com>
# Copyright 2012, Bryan W. Berry
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

actions(
  :cherry_pick,
  :configure,
  :dump,
  :install,
  :install_with_make,
  :put,
  :setup_py,
  :setup_py_build,
  :setup_py_install,
  :unzip
)

default_action :install

attr_accessor :extension,
  :home_dir,
  :path,
  :prefix_bin,
  :prefix_root,
  :release_file,
  :version

attribute :owner, kind_of: String, default: 'root'
attribute :group, kind_of: [String, Fixnum], default: 0
attribute :url, kind_of: String, required: true
attribute :path, kind_of: String, default: nil
attribute :full_path, kind_of: String, default: nil
attribute :append_env_path, kind_of: [TrueClass, FalseClass], default: false
attribute :checksum, regex: /^[a-zA-Z0-9]{64}$/, default: nil
attribute :has_binaries, kind_of: Array, default: []
attribute :creates, kind_of: String, default: nil
attribute :release_file, kind_of: String, default: ''
attribute :strip_leading_dir, kind_of: [TrueClass, FalseClass, NilClass]
attribute :strip_components, kind_of: Integer, default: 1
attribute :mode, kind_of: Fixnum, default: 0755
attribute :prefix_root, kind_of: String, default: nil
attribute :prefix_home, kind_of: String, default: nil
attribute :prefix_bin, kind_of: String, default: nil
attribute :version, kind_of: String, default: nil
attribute :home_dir, kind_of: String, default: nil
attribute :win_install_dir, kind_of: String, default: nil
attribute :environment, kind_of: Hash, default: {}
attribute :autoconf_opts, kind_of: Array, default: []
attribute :make_opts, kind_of: Array, default: []
attribute :home_dir, kind_of: String, default: nil
attribute :autoconf_opts, kind_of: Array, default: []
attribute :extension, kind_of: String
