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

task :pegasus_unit_tests do
  Dir.chdir(pegasus_dir) do
    HipChat.wrap("pegasus ruby unit tests") do
      RakeUtils.rake 'test'
    end
  end
end

task :shared_unit_tests do
  Dir.chdir(shared_dir) do
    HipChat.wrap("shared ruby unit tests") do
      RakeUtils.rake 'test'
    end
  end
end

task :dashboard_unit_tests do
  Dir.chdir(dashboard_dir) do
    name = "dashboard ruby unit tests"
    HipChat.wrap(name) do
      # Unit tests mess with the database so stop the service before running them
      RakeUtils.stop_service CDO.dashboard_unicorn_name
      RakeUtils.rake 'db:test:prepare'
      ENV['DISABLE_SPRING'] = '1'
      ENV['UNIT_TEST'] = '1'
      RakeUtils.bundle_exec 'rails', 'test'
      ENV.delete 'UNIT_TEST'
      RakeUtils.rake "seed:all"
      RakeUtils.start_service CDO.dashboard_unicorn_name
    end
  end
end

task :ui_test_flakiness do
  Dir.chdir(deploy_dir) do
    flakiness_output = `./bin/test_flakiness 5`
    HipChat.log "Flakiest tests: <br/><pre>#{flakiness_output}</pre>"
  end
end

task :wait_for_test_server do
  RakeUtils.wait_for_url 'https://test-studio.code.org'
end

task :regular_ui_tests do
  Dir.chdir(dashboard_dir('test/ui')) do
    HipChat.log 'Running <b>dashboard</b> UI tests...'
    failed_browser_count = RakeUtils.system_with_hipchat_logging 'bundle', 'exec', './runner.rb', '-d', 'test-studio.code.org', '--parallel', '120', '--magic_retry', '--with-status-page', '--fail_fast'
    if failed_browser_count == 0
      message = '┬──┬ ﻿ノ( ゜-゜ノ) UI tests for <b>dashboard</b> succeeded.'
      HipChat.log message
      HipChat.developers message, color: 'green'
    else
      message = "(╯°□°）╯︵ ┻━┻ UI tests for <b>dashboard</b> failed on #{failed_browser_count} browser(s)."
      HipChat.log message, color: 'red'
      HipChat.developers message, color: 'red', notify: 1
    end
  end
end

task :eyes_ui_tests do
  Dir.chdir(dashboard_dir('test/ui')) do
    HipChat.log 'Running <b>dashboard</b> UI visual tests...'
    eyes_features = `grep -lr '@eyes' features`.split("\n")
    failed_browser_count = RakeUtils.system_with_hipchat_logging 'bundle', 'exec', './runner.rb', '-c', 'ChromeLatestWin7,iPhone', '-d', 'test-studio.code.org', '--eyes', '--with-status-page', '-f', eyes_features.join(","), '--parallel', (eyes_features.count * 2).to_s
    if failed_browser_count == 0
      message = '⊙‿⊙ Eyes tests for <b>dashboard</b> succeeded, no changes detected.'
      HipChat.log message
      HipChat.developers message, color: 'green'
    else
      message = 'ಠ_ಠ Eyes tests for <b>dashboard</b> failed. See <a href="https://eyes.applitools.com/app/sessions/">the console</a> for results or to modify baselines.'
      HipChat.log message, color: 'red'
      HipChat.developers message, color: 'red', notify: 1
    end
  end
end

# do the eyes and sauce labs ui tests in parallel
multitask ui_tests: [:eyes_ui_tests, :regular_ui_tests]

$websites_test = build_task('websites-test', [
  'websites',
  :pegasus_unit_tests,
  :shared_unit_tests,
  :dashboard_unit_tests,
  :ui_test_flakiness,
  :wait_for_test_server,
  :ui_tests
])

task 'test-websites' => [$websites_test]
task 'default' => rack_env?(:test) ? 'test-websites' : 'websites'
