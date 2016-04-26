#
# Author:: Seth Chisamore (<schisamo@opscode.com>)
# Cookbook Name:: 7-zip
# Attribute:: default
#
# Copyright:: Copyright (c) 2011 Opscode, Inc.
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

if kernel['machine'] =~ /x86_64/
  default['7-zip']['url']          = "http://downloads.sourceforge.net/sevenzip/7z922-x64.msi"
  default['7-zip']['checksum']     = "f09bf515289eea45185a4cc673e3bbc18ce608c55b4cf96e77833435c9cdf3dc"
  default['7-zip']['package_name'] = "7-Zip 9.22 (x64 edition)"
else
  default['7-zip']['url']          = "http://downloads.sourceforge.net/sevenzip/7z922.msi"
  default['7-zip']['checksum']     = "86df264d22c3dd3ab80cb55a118da2d41bdd95c2db2cd09a6bbdf48f069e3d7a"
  default['7-zip']['package_name'] = "7-Zip 9.22"
end

default['7-zip']['home']    = "#{ENV['SYSTEMDRIVE']}\\7-zip"
