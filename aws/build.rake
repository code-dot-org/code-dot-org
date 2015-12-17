# -*- coding: utf-8 -*-
# BUILD.RAKE used to contain everything that is now in the top-level Rakefile, i.e. it used to be
# the entire build system and developers needed to remember seperate steps to build each project
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

#
# build_task - BUILDS a TASK that uses a hidden (.dotfile) to keep build steps idempotent. The file
# ".<name>-built" dependes on the files listed in dependencies. If any of those are newer, build_task
# yields to the block provided and then updates ".<name>-built"'s timestamp so that it is up-to-date
# with dependencies. In short, it let's create blocks of Ruby code that are only invoked when one of
# the dependent files changes.
#

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
    (1..count).each do |i|
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

if (rack_env?(:staging) && CDO.name == 'staging') || rack_env?(:development)
  #
  # Define the BLOCKLY[-CORE] BUILD task
  #
  BLOCKLY_CORE_DEPENDENCIES = []#[aws_dir('build.rake')]
  BLOCKLY_CORE_PRODUCT_FILES = Dir.glob(blockly_core_dir('build-output', '**/*'))
  BLOCKLY_CORE_SOURCE_FILES = Dir.glob(blockly_core_dir('**/*')) - BLOCKLY_CORE_PRODUCT_FILES
  BLOCKLY_CORE_TASK = build_task('blockly-core', BLOCKLY_CORE_DEPENDENCIES + BLOCKLY_CORE_SOURCE_FILES) do
    RakeUtils.rake '--rakefile', deploy_dir('Rakefile'), 'build:blockly_core'
  end

  #
  # Define the APPS BUILD task
  #
  APPS_DEPENDENCIES = [BLOCKLY_CORE_TASK]
  APPS_NODE_MODULES = Dir.glob(apps_dir('node_modules', '**/*'))
  APPS_BUILD_PRODUCTS = ['npm-debug.log'].map{|i| apps_dir(i)} + Dir.glob(apps_dir('build', '**/*'))
  APPS_SOURCE_FILES = Dir.glob(apps_dir('**/*')) - APPS_NODE_MODULES - APPS_BUILD_PRODUCTS
  APPS_TASK = build_task('apps', APPS_DEPENDENCIES + APPS_SOURCE_FILES) do
    RakeUtils.system 'cp', deploy_dir('rebuild'), deploy_dir('rebuild-apps')
    RakeUtils.rake '--rakefile', deploy_dir('Rakefile'), 'build:apps'
    RakeUtils.system 'rm', '-rf', dashboard_dir('public/apps-package')
    RakeUtils.system 'cp', '-R', apps_dir('build/package'), dashboard_dir('public/apps-package')
  end

  #
  # Define the SHARED BUILD task
  #
  SHARED_NODE_MODULES = Dir.glob(shared_js_dir('node_modules', '**/*'))
  SHARED_BUILD_PRODUCTS = ['npm-debug.log'].map{|i| shared_js_dir(i)} + Dir.glob(shared_js_dir('build', '**/*'))
  SHARED_SOURCE_FILES = Dir.glob(shared_js_dir('**/*')) - SHARED_NODE_MODULES - SHARED_BUILD_PRODUCTS
  SHARED_TASK = build_task('shared', SHARED_SOURCE_FILES) do
    RakeUtils.system 'cp', deploy_dir('rebuild'), deploy_dir('rebuild-shared')
    RakeUtils.rake '--rakefile', deploy_dir('Rakefile'), 'build:shared'
    RakeUtils.system 'rm', '-rf', dashboard_dir('public/shared-package')
    RakeUtils.system 'cp', '-R', shared_js_dir('build/package'), dashboard_dir('public/shared-package')
  end

  #
  # Define the CODE STUDIO BUILD task
  #
  CODE_STUDIO_NODE_MODULES = Dir.glob(code_studio_dir('node_modules', '**/*'))
  CODE_STUDIO_BUILD_PRODUCTS = ['npm-debug.log'].map{|i| code_studio_dir(i)} + Dir.glob(code_studio_dir('build', '**/*'))
  CODE_STUDIO_SOURCE_FILES = Dir.glob(code_studio_dir('**/*')) - CODE_STUDIO_NODE_MODULES - CODE_STUDIO_BUILD_PRODUCTS
  CODE_STUDIO_TASK = build_task('code-studio', CODE_STUDIO_SOURCE_FILES) do
    RakeUtils.system 'cp', deploy_dir('rebuild'), deploy_dir('rebuild-code-studio')
    RakeUtils.system 'npm', 'run', 'build:min'
    RakeUtils.system 'rm', '-rf', dashboard_dir('public/code-studio-package')
    RakeUtils.system 'cp', '-R', code_studio_dir('build'), dashboard_dir('public/code-studio-package')
  end

  #
  # Define the APPS COMMIT task. If APPS_TASK produces new output, that output needs to be
  #   committed because it's input for the DASHBOARD task.
  #
  APPS_COMMIT_TASK = build_task('apps-commit', [deploy_dir('rebuild'), APPS_TASK]) do
    blockly_core_changed = !`git status --porcelain #{BLOCKLY_CORE_PRODUCT_FILES.join(' ')}`.strip.empty?

    apps_changed = false
    Dir.chdir(dashboard_dir('public/apps-package')) do
      apps_changed = !`git status --porcelain .`.strip.empty?
    end

    if blockly_core_changed || apps_changed
      if RakeUtils.git_updates_available?
        # NOTE: If we have local changes as a result of building APPS_TASK, but there are new
        # commits pending in the repository, it is better to pull the repository first and commit
        # these changes after we're caught up with the repository because, if we committed the changes
        # before pulling we would need to manually handle a "merge commit" even though it's impossible
        # for there to be file conflicts (because nobody changes the files APPS_TASK builds manually).
        HipChat.log '<b>Apps</b> package updated but git changes are pending; commmiting after next build.', color: 'yellow'
      else
        HipChat.log 'Committing updated <b>apps</b> package...', color: 'purple'
        RakeUtils.system 'git', 'add', *BLOCKLY_CORE_PRODUCT_FILES
        RakeUtils.system 'git', 'add', '--all', dashboard_dir('public/apps-package')
        message = "Automatically built.\n\n#{IO.read(deploy_dir('rebuild-apps'))}"
        RakeUtils.system 'git', 'commit', '-m', Shellwords.escape(message)
        RakeUtils.git_push
        RakeUtils.system 'rm', '-f', deploy_dir('rebuild-apps')
      end
    else
      HipChat.log '<b>apps</b> package unmodified, nothing to commit.'
      RakeUtils.system 'rm', '-f', deploy_dir('rebuild-apps')
    end
  end

  #
  # Define the SHARED COMMIT task. If SHARED_TASK produces new output, that output needs to be
  #   committed because it's input for the DASHBOARD task.
  #
  SHARED_COMMIT_TASK = build_task('shared-commit', [deploy_dir('rebuild'), SHARED_TASK]) do
    shared_changed = false
    Dir.chdir(dashboard_dir('public/shared-package')) do
      shared_changed = !`git status --porcelain .`.strip.empty?
    end

    if shared_changed
      if RakeUtils.git_updates_available?
        # NOTE: If we have local changes as a result of building SHARED_TASK, but there are new
        # commits pending in the repository, it is better to pull the repository first and commit
        # these changes after we're caught up with the repository because, if we committed the changes
        # before pulling we would need to manually handle a "merge commit" even though it's impossible
        # for there to be file conflicts (because nobody changes the files SHARED_TASK builds manually).
        HipChat.log '<b>Shared</b> package updated but git changes are pending; commmiting after next build.', color: 'yellow'
      else
        HipChat.log 'Committing updated <b>shared</b> package...', color: 'purple'
        RakeUtils.system 'git', 'add', '--all', dashboard_dir('public/shared-package')
        message = "Automatically built.\n\n#{IO.read(deploy_dir('rebuild-shared'))}"
        RakeUtils.system 'git', 'commit', '-m', Shellwords.escape(message)
        RakeUtils.git_push
        RakeUtils.system 'rm', '-f', deploy_dir('rebuild-shared')
      end
    else
      HipChat.log '<b>shared</b> package unmodified, nothing to commit.'
      RakeUtils.system 'rm', '-f', deploy_dir('rebuild-shared')
    end
  end

  #
  # Define the SHARED COMMIT task. If SHARED_TASK produces new output, that output needs to be
  #   committed because it's input for the DASHBOARD task.
  #
  CODE_STUDIO_COMMIT_TASK = build_task('code-studio-commit', [deploy_dir('rebuild'), CODE_STUDIO_TASK]) do
    code_studio_changed = false
    Dir.chdir(dashboard_dir('public/code-studio-package')) do
      code_studio_changed = !`git status --porcelain .`.strip.empty?
    end

    if code_studio_changed
      if RakeUtils.git_updates_available?
        # NOTE: If we have local changes as a result of building SHARED_TASK, but there are new
        # commits pending in the repository, it is better to pull the repository first and commit
        # these changes after we're caught up with the repository because, if we committed the changes
        # before pulling we would need to manually handle a "merge commit" even though it's impossible
        # for there to be file conflicts (because nobody changes the files SHARED_TASK builds manually).
        HipChat.log '<b>code-studio</b> package updated but git changes are pending; commmiting after next build.', color: 'yellow'
      else
        HipChat.log 'Committing updated <b>code-studio</b> package...', color: 'purple'
        RakeUtils.system 'git', 'add', '--all', dashboard_dir('public/code-studio-package')
        message = "Automatically built.\n\n#{IO.read(deploy_dir('rebuild-code-studio'))}"
        RakeUtils.system 'git', 'commit', '-m', Shellwords.escape(message)
        RakeUtils.git_push
        RakeUtils.system 'rm', '-f', deploy_dir('rebuild-code-studio')
      end
    else
      HipChat.log '<b>code-studio</b> package unmodified, nothing to commit.'
      RakeUtils.system 'rm', '-f', deploy_dir('rebuild-code-studio')
    end
  end

else
  APPS_COMMIT_TASK = build_task('apps-commit') {}
  SHARED_COMMIT_TASK = build_task('shared-commit') {}
  CODE_STUDIO_COMMIT_TASK = build_task('code-studio-commit') {}
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
    Dir.chdir(cookbooks_dir) do
      old_gemfile = ENV['BUNDLE_GEMFILE']
      ENV['BUNDLE_GEMFILE'] = File.join(cookbooks_dir, 'Gemfile')
      begin
        RakeUtils.bundle_install
        RakeUtils.bundle_exec 'berks', 'install'
        RakeUtils.bundle_exec 'berks', 'upload', (rack_env?(:production) ? '' : '--no-freeze')
        RakeUtils.bundle_exec 'berks', 'apply', rack_env
      ensure
        ENV['BUNDLE_GEMFILE'] = old_gemfile
      end
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

$websites = build_task('websites', [deploy_dir('rebuild'), SHARED_COMMIT_TASK, APPS_COMMIT_TASK, CODE_STUDIO_COMMIT_TASK, :build_with_cloudfront, :deploy])
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

# currently this is only implemented for dashboard ruby unit tests but
# maybe in the future it will work for other types of tests
def log_coverage_results(name)
  results_file = dashboard_dir('coverage/.last_run.json')
  results = JSON.parse(File.read(results_file))
  HipChat.log "<b>#{name}</b> coverage: #{results["result"]["covered_percent"]}%. Details: https:#{CDO.studio_url('coverage/index.html')}", color: 'green'
rescue Exception => e
  HipChat.log "Couldn't read test coverage results at #{results_file}: #{e.message}\n#{e.backtrace.join("\n")}"
end

COVERAGE_SYMLINK = dashboard_dir 'public/coverage'
file COVERAGE_SYMLINK do
  Dir.chdir(dashboard_dir('public')) do
    RakeUtils.system_ 'ln', '-s', '../coverage', 'coverage'
  end
end

task :dashboard_unit_tests => [COVERAGE_SYMLINK] do
  Dir.chdir(dashboard_dir) do
    name = "dashboard ruby unit tests"
    with_hipchat_logging(name) do
      # Unit tests mess with the database so stop the service before running them
      RakeUtils.stop_service CDO.dashboard_unicorn_name
      RakeUtils.rake 'db:schema:load'
      RakeUtils.rake 'test', 'COVERAGE=1'
      log_coverage_results(name)
      RakeUtils.rake "seed:all"
      RakeUtils.start_service CDO.dashboard_unicorn_name
    end
  end
end

UI_TEST_SYMLINK = dashboard_dir 'public/ui_test'
file UI_TEST_SYMLINK do
  Dir.chdir(dashboard_dir('public')) do
    RakeUtils.system_ 'ln', '-s', '../test/ui', 'ui_test'
  end
end

task :dashboard_browserstack_ui_tests => [UI_TEST_SYMLINK] do
  Dir.chdir(dashboard_dir) do
    Dir.chdir('test/ui') do
      HipChat.log 'Running <b>dashboard</b> UI tests...'
      failed_browser_count = RakeUtils.system_ 'bundle', 'exec', './runner.rb', '-d', 'test-studio.code.org', '--parallel', '70', '--auto_retry', '--html'
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
end

task :dashboard_eyes_ui_tests => [UI_TEST_SYMLINK] do
  Dir.chdir(dashboard_dir) do
    Dir.chdir('test/ui') do
      HipChat.log 'Running <b>dashboard</b> UI visual tests...'
      eyes_features = `grep -lr '@eyes' features`.split("\n")
      failed_browser_count = RakeUtils.system_ 'bundle', 'exec', './runner.rb', '-c', 'ChromeLatestWin7,iPhone', '-d', 'test-studio.code.org', '--eyes', '--html', '-f', eyes_features.join(","), '--parallel', eyes_features.count.to_s
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
end

# do the eyes and browserstack ui tests in parallel
multitask dashboard_ui_tests: [:dashboard_eyes_ui_tests, :dashboard_browserstack_ui_tests]

$websites_test = build_task('websites-test', [deploy_dir('rebuild'), :build_with_cloudfront, :deploy, :pegasus_unit_tests, :shared_unit_tests, :dashboard_unit_tests, :dashboard_ui_tests])

task 'test-websites' => [$websites_test]
