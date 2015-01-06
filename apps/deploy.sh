#!/usr/bin/env ruby
require_relative '../deployment'
require 'cdo/rake_utils'

RakeUtils.sudo 'npm', 'install', '-g' 'grunt-cli'
RakeUtils.sudo 'npm', 'install'
RakeUtils.sudo 'MOOC_LOCALIZE=1', 'grunt'
RakeUtils.sudo 'chown' '-R' 'ubuntu:ubuntu' 'build/package'
