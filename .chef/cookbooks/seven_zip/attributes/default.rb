#
# Author:: Seth Chisamore (<schisamo@chef.io>)
# Cookbook Name:: seven_zip
# Attribute:: default
#
# Copyright:: Copyright (c) 2011-2016 Chef Software, Inc.
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
  default['seven_zip']['url']          = 'http://www.7-zip.org/a/7z1514-x64.msi'
  default['seven_zip']['checksum']     = 'cefe1a9092d8a6be68468c33910d6206b40e934fb63cab686c5cccf369fbf712'
  default['seven_zip']['package_name'] = '7-Zip 15.14 (x64 edition)'
else
  default['seven_zip']['url']          = 'http://www.7-zip.org/a/7z1514.msi'
  default['seven_zip']['checksum']     = 'eaf58e29941d8ca95045946949d75d9b5455fac167df979a7f8e4a6bf2d39680'
  default['seven_zip']['package_name'] = '7-Zip 15.14'
end
