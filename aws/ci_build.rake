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
require 'cdo/hip_chat'
require 'cdo/only_one'
require 'shellwords'
require 'cdo/aws/cloudfront'
require 'cdo/aws/s3_packaging'

def format_duration(total_seconds)
  total_seconds = total_seconds.to_i
  minutes = (total_seconds / 60).to_i
  seconds = total_seconds - (minutes * 60)
  "%.1d:%.2d minutes" % [minutes, seconds]
end

def with_hipchat_logging(name)
  start_time = Time.now
  HipChat.log "Running #{name}..."
  yield if block_given?
  HipChat.log "#{name} succeeded in #{format_duration(Time.now - start_time)}"

rescue => e
  # notify developers room and our own room
  "<b>#{name}</b> failed in #{format_duration(Time.now - start_time)}".tap do |message|
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

#
# threaded_each provide a simple way to process an array of elements using multiple threads.
# create_threads is a helper for threaded_each.
#
def create_threads(count)
  [].tap do |threads|
    count.times do
      threads << Thread.new do
        yield
      end
    end
  end
end

def threaded_each(array, thread_count=2)
  # NOTE: Queue is used here because it is threadsafe - it is the ONLY threadsafe datatype in base ruby!
  #   Without Queue, the array would need to be protected using a Mutex.
  queue = Queue.new.tap do |queue|
    array.each do |i|
      queue << i
    end
  end

  threads = create_threads(thread_count) do
    until queue.empty?
      next unless item = queue.pop(true) rescue nil
      yield item if block_given?
    end
  end

  threads.each(&:join)
end

#
# Define the BLOCKLY[-CORE] BUILD task
#
BLOCKLY_CORE_DEPENDENCIES = []#[aws_dir('build.rake')]
BLOCKLY_CORE_PRODUCT_FILES = Dir.glob(blockly_core_dir('build-output', '**/*'))
BLOCKLY_CORE_SOURCE_FILES = Dir.glob(blockly_core_dir('**/*')) - BLOCKLY_CORE_PRODUCT_FILES
BLOCKLY_CORE_TASK = build_task('blockly-core', BLOCKLY_CORE_DEPENDENCIES + BLOCKLY_CORE_SOURCE_FILES) do
  # only let staging build/commit blockly-core
  if rack_env?(:staging)
    apps_sentinel = apps_dir('/lib/blockly/sentinel')
    RakeUtils.rake '--rakefile', deploy_dir('Rakefile'), 'build:blockly_core'
    HipChat.log 'Committing updated <b>blockly core</b> files...', color: 'purple'
    message = "Automatically built.\n\n#{IO.read(deploy_dir('rebuild-apps'))}"
    RakeUtils.system 'git', 'add', *BLOCKLY_CORE_PRODUCT_FILES
    RakeUtils.system 'echo', "\"#{Time.new}\" >| #{apps_sentinel}"
    RakeUtils.system 'git', 'add', apps_sentinel
    RakeUtils.system 'git', 'commit', '-m', Shellwords.escape(message)
    RakeUtils.git_push
  end
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
  Dir.chdir(apps_dir) { RakeUtils.system 'grunt test' }
  HipChat.log 'apps test finished'

  # upload to s3
  package = packager.upload_package_to_s3('/build/package')
  HipChat.log "Uploaded apps package to S3: #{packager.commit_hash}"
  packager.decompress_package(package)
end

#
# Define the CODE STUDIO BUILD task.
#
task :code_studio_task do
  packager = S3Packaging.new('code-studio', code_studio_dir, dashboard_dir('public/code-studio-package'))

  updated_package = packager.update_from_s3
  if updated_package
    HipChat.log "Downloaded code-studio package from S3: #{packager.commit_hash}"
    next # no need to do anything if we already got a package from s3
  end

  # Test and staging are the only environments that should be uploading new packages
  raise 'No valid code-studio package found' unless rack_env?(:staging) || rack_env?(:test)

  raise 'Wont build code-studio with staged changes' if RakeUtils.git_staged_changes?(code_studio_dir)

  HipChat.log 'Building code-studio...'
  RakeUtils.system 'cp', deploy_dir('rebuild'), deploy_dir('rebuild-code-studio')
  RakeUtils.rake '--rakefile', deploy_dir('Rakefile'), 'build:code_studio'
  HipChat.log 'code-studio built'

  # upload to s3
  package = packager.upload_package_to_s3('/build')
  HipChat.log "Uploaded code-studio package to S3: #{packager.commit_hash}"
  packager.decompress_package(package)
end

file deploy_dir('rebuild') do
  touch deploy_dir('rebuild')
end

def stop_frontend(name, host, log_path)
  # NOTE: The order of these prefers deploy-speed over user-experience. Stopping varnish first
  #   immediately terminates connections to the backends so they stop immediately. Changing the
  #   order to stop Dashboard and Pegasus first would drain the user connections before stopping
  #   which can take a minutes. The Load Balancer has health-checks that will pull the instances
  #   out of rotation and those checks can be directed at either varnish itself, the services through
  #   varnish, or the services directly. So, changing the order here means evalulating whether or not
  #   the ELB health-checks make sense to begin diverting traffic at the right time (vs. returning 503s)
  command = [
    'sudo service varnish stop',
    'sudo service dashboard stop',
    'sudo service pegasus stop',
  ].join(' ; ')

  RakeUtils.system 'ssh', '-i', '~/.ssh/deploy-id_rsa', host, "'#{command} 2>&1'", '>>', log_path
end

#
# upgrade_frontend - this is called by daemon to update the user-facing front-end instances. for
#   this to work, daemon has an SSH key (deploy-id_rsa) that gives it access to connect to the front-ends.
#
def upgrade_frontend(name, host)
  commands = [
    "cd #{rack_env}",
    'git pull --ff-only',
    'sudo bundle install',
    'rake build',
  ]
  command = commands.join(' && ')

  HipChat.log "Upgrading <b>#{name}</b> (#{host})..."

  log_path = aws_dir "deploy-#{name}.log"

  # Stop the frontend before running the commands so that the git pull doesn't modify files
  # out from under a running instance. The rake build command will restart the instance.
  stop_frontend name, host, log_path

  success = false
  begin
    RakeUtils.system 'ssh', '-i', '~/.ssh/deploy-id_rsa', host, "'#{command} 2>&1'", '>', log_path
    #HipChat.log "Upgraded <b>#{name}</b> (#{host})."
    success = true
  rescue
    HipChat.log "<b>#{name}</b> (#{host}) failed to upgrade, removing from rotation.", color: 'red'
    # The frontend is in indeterminate state, so make sure it is stopped.
    stop_frontend name, host, log_path
    success = false
  end

  puts IO.read log_path
  success
end

# Synchronize the Chef cookbooks to the Chef repo for this environment using Berkshelf.
task :chef_update do
  if CDO.daemon && CDO.chef_managed
    RakeUtils.with_bundle_dir(cookbooks_dir) do
      RakeUtils.bundle_exec 'berks', 'install'
      RakeUtils.bundle_exec 'berks', 'upload', (rack_env?(:production) ? '' : '--no-freeze')
      RakeUtils.bundle_exec 'berks', 'apply', rack_env
    end
  end
end

# Deploy updates to CloudFront in parallel with the local build to optimize total CI build time.
multitask build_with_cloudfront: [:build, :cloudfront]

# Update CloudFront distribution with any changes to the http cache configuration.
# If there are changes to be applied, the update can take 15 minutes to complete.
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
task :deploy do
  with_hipchat_logging("deploy frontends") do
    if CDO.daemon && CDO.app_servers.any?
      Dir.chdir(deploy_dir) do
        num_failures = 0
        thread_count = (CDO.app_servers.keys.length * 0.20).ceil
        threaded_each CDO.app_servers.keys, thread_count do |name|
          succeeded = upgrade_frontend name, CDO.app_servers[name]
          if !succeeded
            num_failures += 1
            raise 'too many frontend upgrade failures, aborting deploy' if num_failures > MAX_FRONTEND_UPGRADE_FAILURES
          end
        end
      end
    end
  end
end

$websites = build_task('websites', [
  deploy_dir('rebuild'),
  BLOCKLY_CORE_TASK,
  :apps_task,
  :code_studio_task,
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
      RakeUtils.rake 'db:schema:load'
      RakeUtils.rake 'test'
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

UI_TEST_SYMLINK = dashboard_dir 'public/ui_test'
file UI_TEST_SYMLINK do
  Dir.chdir(dashboard_dir('public')) do
    RakeUtils.system_ 'ln', '-s', '../test/ui', 'ui_test'
  end
end

task :regular_ui_tests => [UI_TEST_SYMLINK] do
  Dir.chdir(dashboard_dir('test/ui')) do
    HipChat.log 'Running <b>dashboard</b> UI tests...'
    failed_browser_count = RakeUtils.system_with_hipchat_logging 'bundle', 'exec', './runner.rb', '-d', 'test-studio.code.org', '--parallel', '50', '--magic_retry', '--html', '--fail_fast'
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

task :eyes_ui_tests => [UI_TEST_SYMLINK] do
  Dir.chdir(dashboard_dir('test/ui')) do
    HipChat.log 'Running <b>dashboard</b> UI visual tests...'
    eyes_features = `grep -lr '@eyes' features`.split("\n")
    failed_browser_count = RakeUtils.system_with_hipchat_logging 'bundle', 'exec', './runner.rb', '-c', 'ChromeLatestWin7,iPhone', '-d', 'test-studio.code.org', '--eyes', '--html', '-f', eyes_features.join(","), '--parallel', (eyes_features.count * 2).to_s
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
  :ui_tests
])

task 'test-websites' => [$websites_test]
task 'default' => rack_env?(:test) ? 'test-websites' : 'websites'
