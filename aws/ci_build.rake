# -*- coding: utf-8 -*-
# CI_BUILD.RAKE used to contain everything that is now in the top-level Rakefile, i.e. it used to be
# the entire build system and developers needed to remember separate steps to build each project
# or wait for CI. Since then, the building of projects has been moved out to the top-level Rakefile
# (which this now calls) and this Rakefile is responsible for the "integration" portions of continuous
# integration.
#
# This Rakefile CAN be confusing to read because it is the kind of Rakefile that globs the filesystem
# and then calls functions that generate the rules that are eventually invoked.
#

require_relative '../deployment'
require 'cdo/rake_utils'
require 'cdo/git_utils'
require 'cdo/hip_chat'
require 'cdo/only_one'
require 'shellwords'
require 'cdo/aws/cloudfront'
require 'cdo/aws/s3_packaging'

#
# build_task - BUILDS a TASK that uses a hidden (.dotfile) to keep build steps idempotent. The file
# ".<name>-built" depends on the files listed in dependencies. If any of those are newer, build_task
# yields to the block provided and then updates ".<name>-built"'s timestamp so that it is up-to-date
# with dependencies. In short, it let's create blocks of Ruby code that are only invoked when one of
# the dependent files changes.
#
def build_task(name, dependencies=[], params={})
  path = aws_dir(".#{name}-built")

  file path => dependencies do
    HipChat.wrap(name) do
      yield if block_given?
      touch path
    end
  end

  path
end

file deploy_dir('rebuild') do
  touch deploy_dir('rebuild')
end

$websites = build_task('websites', [
  deploy_dir('rebuild'),
  :apps_task,
  :firebase_task,
  :build_with_cloudfront,
  :deploy
])

task 'websites' => [$websites] {}

$websites_test = build_task('websites-test', [
  'websites',
])

task 'test-websites' => [$websites_test]
task 'default' => rack_env?(:test) ? 'test-websites' : 'websites'
