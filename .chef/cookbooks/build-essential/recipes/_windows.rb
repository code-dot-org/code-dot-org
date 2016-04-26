#
# Cookbook Name:: build-essential
# Recipe:: _mingw
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
require 'ostruct'

include_recipe '7-zip::default'

[
  msys_p('http://downloads.sourceforge.net/mingw/msysCORE-1.0.17-1-msys-1.0.17-bin.tar.lzma',
    '2d707ae394f5797a0718a1ffd886d4be1a83ed1f68a4ee4a5b19efd3208b037f'),
  msys_p('http://downloads.sourceforge.net/mingw/msysCORE-1.0.17-1-msys-1.0.17-ext.tar.lzma',
    '2c68f68cb2caa27aa014461133cf578433e62c823cdac3350be62b9c3e6460a0'),
  msys_p('http://downloads.sourceforge.net/mingw/coreutils-5.97-3-msys-1.0.13-bin.tar.lzma',
    'f8c7990416ea16a74ac336dcfe0f596bc46b8724b2d58cf8a3509414220b2366'),
  msys_p('http://downloads.sourceforge.net/mingw/coreutils-5.97-3-msys-1.0.13-ext.tar.lzma',
    '3f525aa6c94ff79ffd656ddf0a56d3244f982ea4a0d274674d9875afc1e04579'),
  msys_p('http://downloads.sourceforge.net/mingw/libiconv-1.14-1-msys-1.0.17-dll-2.tar.lzma',
    '196921e8c232259c8e6a6852b9ee8d9ab2d29a91419f0c8dc27ba6f034231683'),
  msys_p('http://downloads.sourceforge.net/mingw/libintl-0.18.1.1-1-msys-1.0.17-dll-8.tar.lzma',
    '29db8c969661c511fbe2a341ab25c993c5f9c555842a75d6ddbcfa70dec16910'),
  msys_p('http://downloads.sourceforge.net/mingw/libtermcap-0.20050421_1-2-msys-1.0.13-dll-0.tar.lzma',
    '62b58fe0880f0972fcc84a819265989b02439c1c5185870227bd25f870f7adb6'),
  msys_p('http://downloads.sourceforge.net/mingw/make-3.81-3-msys-1.0.13-bin.tar.lzma',
    '847f0cbbf07135801c8e67bf692d29b1821e816ad828753c997fa869a9b89988'),
  msys_p('http://downloads.sourceforge.net/mingw/perl-5.8.8-1-msys-1.0.17-bin.tar.lzma',
    '987b939ce00172dd034105d2a908cee5704f67027de98f4dcc69a1006a327a99'),
  msys_p('http://downloads.sourceforge.net/mingw/zlib-1.2.3-2-msys-1.0.13-dll.tar.lzma',
    '4178940828b928b2d5a33042cc83fbb992b4bfb9ffeaef6dc3e555f2a6a8c0d1'),
  msys_p('http://downloads.sourceforge.net/mingw/libgdbm-1.8.3-3-msys-1.0.13-dll-3.tar.lzma',
    '7412f874487652e70022ab8601655ee359ed537b017b7dba360b69237c9093c6'),
  msys_p('http://downloads.sourceforge.net/mingw/libcrypt-1.1_1-3-msys-1.0.13-dll-0.tar.lzma',
    '31f157b6993509849407672503b8b89e09e9e37e8833b6678b9cbbcbf597f918'),
  msys_p('http://downloads.sourceforge.net/mingw/bash-3.1.23-1-msys-1.0.18-bin.tar.xz',
    '38da5419969ab883058a96322bb0f51434dd4e9f71de09cd4f75b96750944533'),
  msys_p('http://downloads.sourceforge.net/mingw/mksh-40.0.0c-1-msys-1.0.17-bin.tar.lzma',
    '8311342acf0b9f0264fd0d8384a826537973d798ca5904349fea1e0c9d909e54'),
  msys_p('http://downloads.sourceforge.net/mingw/termcap-0.20050421_1-2-msys-1.0.13-bin.tar.lzma',
    '906e756332b5fd6c10eeb4b6362f5957dd8cafa5679f89d9adbae59dff7f2ff2'),
  msys_p('http://downloads.sourceforge.net/mingw/libregex-1.20090805-2-msys-1.0.13-dll-1.tar.lzma',
    '85dd8c1e27a90675c5f867be57ba7ae2bb55dde8cd2d19f284c896be134bd3d1'),
  msys_p('http://downloads.sourceforge.net/mingw/crypt-1.1_1-3-msys-1.0.13-bin.tar.lzma',
    '58369b42c38144d3aa5a337ebf1e182a66e88db30ccc42796f2074f251ee1fed'),
  msys_p('http://downloads.sourceforge.net/mingw/m4-1.4.14-1-msys-1.0.13-bin.tar.lzma',
    '41058bc9a691ad01fdd979f1a4ac4ee071bd5ce93f660db5c0b3cfad4487e33e'),
  msys_p('http://downloads.sourceforge.net/mingw/bison-2.4.2-1-msys-1.0.13-bin.tar.lzma',
    '349f3e312bf71f8a2ac68a7bd2f86b03dacc565b0fd27eef5d604e8be402390e'),
  msys_p('http://downloads.sourceforge.net/mingw/flex-2.5.35-2-msys-1.0.13-bin.tar.lzma',
    '9715511a2eafb7e2402029059d4b9db96bd40d8b72908db2571c009745c47a63'),
  msys_p('http://downloads.sourceforge.net/mingw/findutils-4.4.2-2-msys-1.0.13-bin.tar.lzma',
    '779e819b7942dc070c45f4cba633e6a9ae4bfe8b506a3541f4ce86ad0595726d'),
  msys_p('http://downloads.sourceforge.net/mingw/sed-4.2.1-2-msys-1.0.13-bin.tar.lzma',
    'f73059204cecb691e7840108b7c0cbbfcebf50c0e5c6e3a2326e0eedce5d1b94'),
  msys_p('http://downloads.sourceforge.net/mingw/gawk-3.1.7-2-msys-1.0.13-bin.tar.lzma',
    'eb15478ea76e75b666ad7fc7049de21b9f487e0e1ea0e96d40953a477e91c3dd'),
  msys_p('http://downloads.sourceforge.net/mingw/grep-2.5.4-2-msys-1.0.13-bin.tar.lzma',
    '4842a1754df98db994622e8ffab3bea7fbce77e05778cd5d3831e76ac90440ba'),
  msys_p('http://downloads.sourceforge.net/mingw/less-436-2-msys-1.0.13-bin.tar.lzma',
    '1bbd114846026f9ca4fcc4e18ba20f060384f623f1ef22b326df8c55419c0b84'),
  msys_p('http://downloads.sourceforge.net/mingw/diffutils-2.8.7.20071206cvs-3-msys-1.0.13-bin.tar.lzma',
    '522889b044492dd2337c4752ba6262995a11f352ca5fb8a8660349413ea9b864'),
  msys_p('http://downloads.sourceforge.net/mingw/texinfo-4.13a-2-msys-1.0.13-bin.tar.lzma',
    '241eb8e376bf69588d0e02aede35771503c5dcb15c440f97e15e30da79fea864'),
  msys_p('http://downloads.sourceforge.net/mingw/libmagic-5.04-1-msys-1.0.13-dll-1.tar.lzma',
    '65117008598675823b3fb25296d0d6c332ce56b72950e0f90f9063ac098afac3'),
  msys_p('http://downloads.sourceforge.net/mingw/file-5.04-1-msys-1.0.13-bin.tar.lzma',
    'e9ceffa49629524c84d07da77c1a5f37837f68a09e56cad30bea1df0a21e5fc2'),
  msys_p('http://downloads.sourceforge.net/mingw/mintty-1.0.3-1-msys-1.0.17-bin.tar.lzma',
    '0b3e7b57c81646eccaff3ca0310abe8367ace69992640be87199ecf5d9443085'),
  msys_p('http://downloads.sourceforge.net/mingw/patch-2.6.1-1-msys-1.0.13-bin.tar.lzma',
    'c8b7771304fb5e9fc33d8fca9045402f2e1bca055bf0b28127f3c3e85a254f67')
].each do |package|
  potentially_at_compile_time do
    build_essential_msys_archive package.url do
      checksum package.checksum
      root_dir node['build-essential']['msys']['path']
    end
  end
end

[
  msys_p('http://iweb.dl.sourceforge.net/project/tdm-gcc/TDM-GCC%205%20series/5.1.0-tdm64-1/gcc-5.1.0-tdm64-1-core.tar.lzma',
    '29393aac890847089ad1e93f81a28f6744b1609c00b25afca818f3903e42e4bd'),
  msys_p('http://iweb.dl.sourceforge.net/project/tdm-gcc/MinGW-w64%20runtime/GCC%205%20series/mingw64runtime-v4-git20150618-gcc5-tdm64-1.tar.lzma',
    '29186e0bb36824b10026d78bdcf238d631d8fc1d90718d2ebbd9ec239b6f94dd'),
  msys_p('http://sourceforge.net/projects/tdm-gcc/files/GNU%20binutils/binutils-2.25-tdm64-1.tar.lzma',
    '4722bb7b4d46cef714234109e25e5d1cfd29f4e53365b6d615c8a00735f60e40'),
  msys_p('http://sourceforge.net/projects/tdm-gcc/files/TDM-GCC%205%20series/5.1.0-tdm64-1/gcc-5.1.0-tdm64-1-c++.tar.lzma',
    '17fd497318d1ac187a113e8665330d746ad9607a0406ab2374db0d8e6f4094d1')
].each do |package|
  potentially_at_compile_time do
    build_essential_msys_archive package.url do
      root_dir node['build-essential']['msys']['path']
      checksum package.checksum
      mingw true
    end
  end
end
