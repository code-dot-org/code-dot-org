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

#
# build_task - BUILDS a TASK that uses a hidden (.dotfile) to keep build steps idempotent. The file
# ".<name>-built" dependes on the files listed in dependencies. If any of those are newer, build_task
# yields to the block provided and then updates ".<name>-built"'s timestamp so that it is up-to-date
# with dependencies. In short, it let's create blocks of Ruby code that are only invoked when one of
# the dependent files changes.
#
def build_task(name, dependencies=[], params={})
  path = aws_dir(".#{name}-built")

  file path => dependencies do
    begin
      yield if block_given?
      touch path
    rescue => e
      HipChat.log "<b>#{name}</b> FAILED!", color:'red', notify:1
      HipChat.log "/quote #{e}", message_format:'text'
      raise
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
    RakeUtils.system 'rake', '--rakefile', deploy_dir('Rakefile'), 'build:blockly_core'
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
    RakeUtils.system 'rake', '--rakefile', deploy_dir('Rakefile'), 'build:apps'
    RakeUtils.system 'rm', '-rf', dashboard_dir('public/apps-package')
    RakeUtils.system 'cp', '-R', apps_dir('build/package'), dashboard_dir('public/apps-package')
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
        HipChat.log '<b>Apps</b> package updated but git changes are pending; commmiting after next build.', color:'yellow'
      else
        HipChat.log 'Committing updated <b>apps</b> package...', color:'purple'
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
else
  APPS_COMMIT_TASK = build_task('apps-commit') {}
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
    'cd production',
    'git pull',
    'rake build',
  ]
  command = commands.join(' && ')

  HipChat.log "Upgrading <b>#{name}</b> (#{host})..."

  log_path = aws_dir "deploy-#{name}.log"

  begin
    RakeUtils.system 'ssh', '-i', '~/.ssh/deploy-id_rsa', host, "'#{command} 2>&1'", '>', log_path
    #HipChat.log "Upgraded <b>#{name}</b> (#{host})."
  rescue
    HipChat.log "<b>#{name}</b> (#{host}) failed to upgrade, removing from rotation.", color:'red'
    stop_frontend name, host, log_path
  end

  puts IO.read log_path
end

#
# The main build task (calls the top-level Rakefile)
#
$websites = build_task('websites', [deploy_dir('rebuild'), APPS_COMMIT_TASK]) do
  Dir.chdir(deploy_dir) do
    # Lint
    RakeUtils.system 'rake', 'lint' if CDO.lint

    # Build myself
    RakeUtils.system 'rake', 'build'

    # If I'm daemon, do some additional work:
    if rack_env?(:production) && CDO.daemon
      # BUGBUG: Laurel added this here. It probably belongs in the top-level Rakefile as these values
      #   should be seeded to memcached prior to restarting the Dashboard service which will already
      #   have happened by this moment. In practice, no traffic hits Daemon so this isn't critical, but
      #   should be addressed.
      Dir.chdir(dashboard_dir) do
        HipChat.log "Putting <b>dashboard</b> scripts in memcached..."
        RakeUtils.rake 'seed:script_cache_to_memcached'
      end

      # Update the front-end instances, in parallel, but not all at once. When the infrstracture is
      # properly scaled we should be able to upgrade 20% of the front-ends at a time. Right now we're
      # over-subscribed (have more resources than we need) so we're restarting 50% of the front-ends.
      thread_count = 2
      threaded_each CDO.app_servers.keys, thread_count do |name|
        upgrade_frontend name, CDO.app_servers[name]
      end
    end
  end
end
task 'websites' => [$websites] {}

#
# This is the build task when running on the test instance. It performs a normal local build
# via the top-level Rakefile and then runs our tests.
#

task :build do
  Dir.chdir(deploy_dir) do
    RakeUtils.system 'rake', 'build'
  end
end

task :pegasus_unit_tests do
  Dir.chdir(pegasus_dir) do
    HipChat.log 'Running <b>pegasus</b> unit tests...'
    begin
      RakeUtils.rake 'test'
    rescue
      HipChat.log 'Unit tests for <b>pegasus</b> failed.', color:'red'
      HipChat.developers 'Unit tests for <b>pegasus</b> failed.', color:'red', notify:1
      raise
    end
  end
end

task :shared_unit_tests do
  Dir.chdir(shared_dir) do
    HipChat.log 'Running <b>shared</b> unit tests...'
    begin
      RakeUtils.rake 'test'
    rescue
      HipChat.log 'Unit tests for <b>shared</b> failed.', color:'red'
      HipChat.developers 'Unit tests for <b>shared</b> failed.', color:'red', notify:1
      raise
    end
  end
end

task :dashboard_unit_tests do
  Dir.chdir(dashboard_dir) do
    # Unit tests mess with the database so stop the service before running them and
    # reset the database afterward.
    RakeUtils.stop_service CDO.dashboard_unicorn_name
    HipChat.log 'Running <b>dashboard</b> unit tests...'
    begin
      RakeUtils.rake 'test'
    rescue
      HipChat.log 'Unit tests for <b>dashboard</b> failed.', color:'red'
      HipChat.developers 'Unit tests for <b>dashboard</b> failed.', color:'red', notify:1
      raise
    end
    HipChat.log "Resetting <b>dashboard</b> database..."
    RakeUtils.rake 'db:schema:load'
    HipChat.log "Reseeding <b>dashboard</b>..."
    RakeUtils.rake 'seed:all'
    RakeUtils.start_service CDO.dashboard_unicorn_name
  end
end

task :dashboard_browserstack_ui_tests do
  Dir.chdir(dashboard_dir) do
    Dir.chdir('test/ui') do
      HipChat.log 'Running <b>dashboard</b> UI tests...'
      failed_browser_count = RakeUtils.system_ 'bundle', 'exec', './runner.rb', '-d', 'test.learn.code.org', '-p', '10', '-a', '--html'
      if failed_browser_count == 0
        message = '┬──┬ ﻿ノ( ゜-゜ノ) UI tests for <b>dashboard</b> succeeded.'
        HipChat.log message
        HipChat.developers message, color:'green'
      else
        message = "(╯°□°）╯︵ ┻━┻ UI tests for <b>dashboard</b> failed on #{failed_browser_count} browser(s)."
        HipChat.log message, color:'red'
        HipChat.developers message, color:'red', notify:1
      end
    end
  end
end

task :dashboard_eyes_ui_tests do
  Dir.chdir(dashboard_dir) do
    Dir.chdir('test/ui') do
      HipChat.log 'Running <b>dashboard</b> UI visual tests...'
      failed_browser_count = RakeUtils.system_ 'bundle', 'exec', './runner.rb', '-c', 'Chrome33Win7', '-d', 'test.learn.code.org', '--eyes'
      if failed_browser_count == 0
        message = '⊙‿⊙ Eyes tests for <b>dashboard</b> succeeded, no changes detected.'
        HipChat.log message
        HipChat.developers message, color:'green'
      else
        message = 'ಠ_ಠ Eyes tests for <b>dashboard</b> failed. See <a href="https://eyes.applitools.com/app/sessions/">the console</a> for results or to modify baselines.'
        HipChat.log message, color:'red'
        HipChat.developers message, color:'red', notify:1
      end
    end
  end
end

# do the eyes and browserstack ui tests in parallel
multitask dashboard_ui_tests: [:dashboard_eyes_ui_tests, :dashboard_browserstack_ui_tests]

$websites_test = build_task('websites-test', [deploy_dir('rebuild'), :build, :pegasus_unit_tests, :shared_unit_tests, :dashboard_unit_tests, :dashboard_ui_tests])

task 'test-websites' => [$websites_test]
