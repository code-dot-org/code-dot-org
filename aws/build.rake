require_relative '../deployment'
require 'cdo/rake_utils'
require 'cdo/hip_chat'
require 'cdo/only_one'
require 'shellwords'

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

if rack_env?(:staging) || rack_env?(:development)
  BLOCKLY_CORE_DEPENDENCIES = []#[aws_dir('build.rake')]
  BLOCKLY_CORE_PRODUCTS = [
    'blockly_compressed.js',
    'blockly_uncompressed.js',
    'javascript_compressed.js',
    'javascript_uncompressed.js',
    'blocks_compressed.js',
    'blocks_uncompressed.js'
  ]
  BLOCKLY_CORE_PRODUCT_FILES = BLOCKLY_CORE_PRODUCTS.map{|i| blockly_core_dir(i)}
  BLOCKLY_CORE_SOURCE_FILES = Dir.glob(blockly_core_dir('**/*')) - BLOCKLY_CORE_PRODUCT_FILES

  BLOCKLY_CORE_TASK = build_task('blockly-core', BLOCKLY_CORE_DEPENDENCIES + BLOCKLY_CORE_SOURCE_FILES) do
    RakeUtils.system 'rake', '--rakefile', deploy_dir('Rakefile'), 'build:blockly_core'
  end

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

  APPS_COMMIT_TASK = build_task('apps-commit', [deploy_dir('rebuild'), APPS_TASK]) do
    blockly_core_changed = false
    Dir.chdir(blockly_core_dir) do
      blockly_core_changed = !`git status --porcelain #{BLOCKLY_CORE_PRODUCTS.join(' ')}`.strip.empty?
    end

    apps_changed = false;
    Dir.chdir(dashboard_dir('public/apps-package')) do
      apps_changed = !`git status --porcelain .`.strip.empty?
    end

    if blockly_core_changed || apps_changed
      if RakeUtils.git_updates_available?
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
  command = [
    'sudo service varnish stop',
    'sudo service dashboard stop',
    'sudo service pegasus stop',
  ].join(' ; ')

  RakeUtils.system 'ssh', '-i', '~/.ssh/deploy-id_rsa', host, "'#{command} 2>&1'", '>>', log_path
end

def upgrade_frontend(name, host)
  commands = [
    'cd production',
    'git pull',
    'rake build',
  ]

  if name =~ /^frontend-[a-z]\d\d$/
    i = name[-2..-1].to_i
    if i > 5
      commands << 'sudo service pegasus stop'
    end
  end

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

$websites = build_task('websites', [deploy_dir('rebuild'), APPS_COMMIT_TASK]) do
  Dir.chdir(deploy_dir) do
    RakeUtils.system 'rake', 'build'

    if rack_env?(:production) && CDO.daemon
      Dir.chdir(dashboard_dir) do
        HipChat.log "Putting <b>dashboard</b> scripts in redis..."
        RakeUtils.rake 'seed:script_cache_to_redis'
      end

      thread_count = 2
      threaded_each CDO.app_servers.keys, thread_count do |name|
        upgrade_frontend name, CDO.app_servers[name]
      end

      remote_command = [
        'sudo chef-client',
        'sudo service varnish stop',
        'sudo service varnish start',
      ].join('; ')
      threaded_each CDO.varnish_instances, 5 do |host|
        begin
          HipChat.log "Upgrading <b>#{host}</b> varnish instance..."
          RakeUtils.system 'ssh', '-i', '~/.ssh/deploy-id_rsa', host, "'#{remote_command} 2>&1'"
        rescue
          HipChat.log "Unable to upgrade <b>#{host}</b> varnish instance."
        end
      end
    end
  end
end
task 'websites' => [$websites] {}

$websites_test = build_task('websites-test', [deploy_dir('rebuild')]) do
  Dir.chdir(deploy_dir) do
    RakeUtils.system 'rake', 'build'
  end

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

    Dir.chdir('test/ui') do
      HipChat.log 'Running <b>dashboard</b> UI tests...'
      failed_browser_count = RakeUtils.system_ 'bundle', 'exec', './runner.rb', '-d', 'test.learn.code.org', '-p', '10', '-a'
      if failed_browser_count == 0
        HipChat.log 'UI tests for <b>dashboard</b> succeeded.'
        HipChat.developers 'UI tests for <b>dashboard</b> succeeded.', color:'green'
      else
        HipChat.log "UI tests for <b>dashboard</b> failed on #{failed_browser_count} browser(s).", color:'red'
        HipChat.developers "UI tests for <b>dashboard</b> failed on #{failed_browser_count} browser(s).", color:'red', notify:1
      end
    end
  end
end
task 'test-websites' => [$websites_test] {}
