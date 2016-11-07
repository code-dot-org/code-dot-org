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

def with_hipchat_logging(name)
  start_time = Time.now
  HipChat.log "Running #{name}..."
  yield if block_given?
  HipChat.log "#{name} succeeded in #{RakeUtils.format_duration(Time.now - start_time)}"

rescue => e
  # notify developers room and our own room
  "<b>#{name}</b> failed in #{RakeUtils.format_duration(Time.now - start_time)}".tap do |message|
    HipChat.log message, color: 'red', notify: 1
    HipChat.developers message, color: 'red', notify: 1
  end
  # log detailed error information in our own room
  HipChat.log "/quote #{e}\n#{CDO.backtrace e}", message_format: 'text'
  raise
end

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
    with_hipchat_logging(name) do
      yield if block_given?
      touch path
    end
  end

  path
end

task :apps_task do
  packager = S3Packaging.new('apps', apps_dir, dashboard_dir('public/apps-package'))

  updated_package = packager.update_from_s3
  if updated_package
    HipChat.log "Downloaded apps package from S3: #{packager.commit_hash}"
    next # no need to do anything if we already got a package from s3
  end

  # Test and staging are the only environments that should be uploading new packages
  raise 'No valid apps package found' unless rack_env?(:staging) || rack_env?(:test)

  raise 'Wont build apps with staged changes' if RakeUtils.git_staged_changes?(apps_dir)

  HipChat.log 'Building apps...'
  RakeUtils.system 'cp', deploy_dir('rebuild'), deploy_dir('rebuild-apps')
  RakeUtils.rake '--rakefile', deploy_dir('Rakefile'), 'build:apps'
  HipChat.log 'apps built'

  HipChat.log 'testing apps..'
  RakeUtils.rake '--rakefile', deploy_dir('Rakefile'), 'test:apps'
  HipChat.log 'apps test finished'

  # upload to s3
  package = packager.upload_package_to_s3('/build/package')
  HipChat.log "Uploaded apps package to S3: #{packager.commit_hash}"
  packager.decompress_package(package)
end

task :firebase_task do
  RakeUtils.rake '--rakefile', deploy_dir('Rakefile'), 'firebase:upload_rules'
  RakeUtils.rake '--rakefile', deploy_dir('Rakefile'), 'firebase:set_config'
  RakeUtils.rake '--rakefile', deploy_dir('Rakefile'), 'firebase:clear_test_channels'
end

file deploy_dir('rebuild') do
  touch deploy_dir('rebuild')
end

# Synchronize the Chef cookbooks to the Chef repo for this environment using Berkshelf.
task :chef_update do
  if CDO.daemon && CDO.chef_managed
    RakeUtils.with_bundle_dir(cookbooks_dir) do
      # Automatically update Chef cookbook versions in staging environment.
      RakeUtils.bundle_exec './update_cookbook_versions' if rack_env?(:staging)
      RakeUtils.bundle_exec 'berks', 'install'
      if rack_env?(:staging) && GitUtils.file_changed_from_git?(cookbooks_dir)
        RakeUtils.system 'git', 'add', '.'
        RakeUtils.system 'git', 'commit', '-m', '"Updated cookbook versions"'
        RakeUtils.git_push
      end
      RakeUtils.bundle_exec 'berks', 'upload', (rack_env?(:production) ? '' : '--no-freeze')
      RakeUtils.bundle_exec 'berks', 'apply', rack_env
    end
  end
end

# Deploy updates to CloudFront in parallel with the local build to optimize total CI build time.
multitask build_with_cloudfront: [:build, :cloudfront]

# Update CloudFront distribution with any changes to the http cache configuration.
# If there are changes to be applied, the update can take 15 minutes to complete.
# TODO this should eventually be replaced with CloudFormation stack update.
task :cloudfront do
  if CDO.daemon && CDO.chef_managed
    with_hipchat_logging('Update CloudFront') do
      AWS::CloudFront.create_or_update
    end
  end
end

# Perform a normal local build by calling the top-level Rakefile.
# Additionally run the lint task if specified for the environment.
task build: [:chef_update] do
  Dir.chdir(deploy_dir) do
    with_hipchat_logging("rake lint") do
      RakeUtils.rake 'lint' if CDO.lint
    end
    with_hipchat_logging("rake build") do
      RakeUtils.rake 'build'
    end
  end
end

# Update the front-end instances, in parallel, updating up to 20% of the
# instances at any one time.
MAX_FRONTEND_UPGRADE_FAILURES = 5

task :ami do
  with_hipchat_logging('Update AMI') do
    RakeUtils.rake 'stack:ami:start'
  end
end

task deploy: [:ami] do
  with_hipchat_logging('Deploy frontends') do
    RakeUtils.rake 'stack:start'
  end
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
    with_hipchat_logging("pegasus ruby unit tests") do
      RakeUtils.rake 'test'
    end
  end
end

task :shared_unit_tests do
  Dir.chdir(shared_dir) do
    with_hipchat_logging("shared ruby unit tests") do
      RakeUtils.rake 'test'
    end
  end
end

task :dashboard_unit_tests do
  Dir.chdir(dashboard_dir) do
    name = "dashboard ruby unit tests"
    with_hipchat_logging(name) do
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
