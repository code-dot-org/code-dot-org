#!/usr/bin/env ruby
require_relative '../deployment'
require 'cdo/rake_utils'

RakeUtils.sudo 'npm', 'install', '-g' 'grunt-cli'
RakeUtils.sudo 'npm', 'install'
RakeUtils.sudo 'grunt'
RakeUtils.sudo 'chown' '-R' 'ubuntu:ubuntu' 'build/package'
