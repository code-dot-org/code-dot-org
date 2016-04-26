#
# Cookbook Name:: build-essential
# Provider:: msys_archive
#
# Copyright 2016, Chef Software, Inc.
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

action :unpack do
  directory msys_dir do
    action :create
  end

  directory "dir-#{mingw_dir}" do
    action :create
    path mingw_dir
    only_if do
      new_resource.mingw
    end
  end

  directory cache_dir do
    action :create
  end

  # Unpacking involves downloading the tar.whatever.
  # Then we unpack the tar.whatever with 7z, which
  # leaves us with a tar, which can finally be
  # untarred with 7z.

  remote_file cache_path do
    source new_resource.source
    checksum new_resource.checksum
    notifies :run, "execute[#{archive_name}]", :immediately
  end

  execute archive_name do
    command extract_cmd(cache_path, cache_dir)
    action :nothing
    notifies :run, "execute[#{tar_name}]", :immediately
  end

  execute tar_name do
    command extract_cmd(tar_path, unpack_root_dir)
    action :nothing
  end
end

# msys packages will be extracted into the root dir
# mingw packages will get extracted into the root/mingw dir
def unpack_root_dir
  if new_resource.mingw
    mingw_dir
  else
    msys_dir
  end
end

def msys_dir
  new_resource.root_dir
end

def mingw_dir
  ::File.join(new_resource.root_dir, 'mingw')
end

def archive_name
  ::File.basename(new_resource.source)
end

def cache_dir
  ::File.join(unpack_root_dir, '.cache')
end

def cache_path
  ::File.join(cache_dir, archive_name)
end

def tar_name
  ::File.basename(archive_name, ::File.extname(archive_name))
end

def tar_path
  ::File.join(cache_dir, tar_name)
end

def extract_cmd(source_file, dest_dir)
  "7z x #{source_file} -o#{dest_dir} -r -y"
end
