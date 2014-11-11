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

if rack_env?(:staging) || CDO.build_blockly
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

  BLOCKLY_DEPENDENCIES = [BLOCKLY_CORE_TASK]
  BLOCKLY_NODE_MODULES = Dir.glob(blockly_dir('node_modules', '**/*'))
  BLOCKLY_BUILD_PRODUCTS = ['npm-debug.log'].map{|i| blockly_dir(i)} + Dir.glob(blockly_dir('build', '**/*'))
  BLOCKLY_SOURCE_FILES = Dir.glob(blockly_dir('**/*')) - BLOCKLY_NODE_MODULES - BLOCKLY_BUILD_PRODUCTS

  BLOCKLY_TASK = build_task('blockly', BLOCKLY_DEPENDENCIES + BLOCKLY_SOURCE_FILES) do
    RakeUtils.system 'cp', deploy_dir('rebuild'), deploy_dir('rebuild-blockly')
    RakeUtils.system 'rake', '--rakefile', deploy_dir('Rakefile'), 'build:blockly'
    RakeUtils.system 'rm', '-rf', dashboard_dir('public/blockly-package')
    RakeUtils.system 'cp', '-R', blockly_dir('build/package'), dashboard_dir('public/blockly-package')
  end

  BLOCKLY_COMMIT_TASK = build_task('blockly-commit', [deploy_dir('rebuild'), BLOCKLY_TASK]) do
    blockly_core_changed = false
    Dir.chdir(blockly_core_dir) do
      blockly_core_changed = !`git status --porcelain #{BLOCKLY_CORE_PRODUCTS.join(' ')}`.strip.empty?
    end

    blockly_changed = false;
    Dir.chdir(dashboard_dir('public/blockly-package')) do
      blockly_changed = !`git status --porcelain .`.strip.empty?
    end

    if blockly_core_changed || blockly_changed
      if RakeUtils.git_updates_available?
        HipChat.log '<b>Blockly</b> package updated but git changes are pending; commmiting after next build.', color:'yellow'
      else
        HipChat.log 'Committing updated <b>blockly</b> package...', color:'purple'
        RakeUtils.system 'git', 'add', *BLOCKLY_CORE_PRODUCT_FILES
        RakeUtils.system 'git', 'add', '--all', dashboard_dir('public/blockly-package')
        message = "Automatically built.\n\n#{IO.read(deploy_dir('rebuild-blockly'))}"
        RakeUtils.system 'git', 'commit', '-m', Shellwords.escape(message)
        RakeUtils.git_push
        RakeUtils.system 'rm', '-f', deploy_dir('rebuild-blockly')
      end
    else
      HipChat.log '<b>blockly</b> package unmodified, nothing to commit.'
      RakeUtils.system 'rm', '-f', deploy_dir('rebuild-blockly')
    end
  end
else
  BLOCKLY_COMMIT_TASK = build_task('blockly-commit') {}
end

file deploy_dir('rebuild') do
  touch deploy_dir('rebuild')
end

$websites = build_task('websites', [deploy_dir('rebuild'), BLOCKLY_COMMIT_TASK]) do
  Dir.chdir(deploy_dir) do
    RakeUtils.system 'rake', 'build'

    if rack_env?(:production) && CDO.daemon
      CDO.app_instances.each do |host|
        #Process.fork do
          remote_command = [
            'cd production',
            'git pull',
            'rake build',
          ].join('; ')
          RakeUtils.system 'ssh', '-i', '~/.ssh/deploy-id_rsa', host, "'#{remote_command} 2>&1'"
        #end
      end
      #Process.waitall

      CDO.varnish_instances.each do |host|
        #Process.fork do
          remote_command = [
            'sudo chef-client',
            'sudo service varnish stop',
            'sudo service varnish start',
          ].join('; ')
          begin
            HipChat.log "Upgrading <b>#{host}</b> varnish instance..."
            sleep 0.1
            RakeUtils.system 'ssh', '-i', '~/.ssh/deploy-id_rsa', host, "'#{remote_command} 2>&1'"
          rescue
            HipChat.log "Unable to upgrade <b>#{host}</b> varnish instance."
          end
        #end
      end
      #Process.waitall
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
    end
    HipChat.log "Resetting <b>dashboard</b> database..."
    RakeUtils.rake 'db:schema:load'
    HipChat.log "Reseeding <b>dashboard</b>..."
    RakeUtils.rake 'seed:all'
    RakeUtils.start_service CDO.dashboard_unicorn_name

    Dir.chdir('test/ui') do
      HipChat.log 'Running <b>dashboard</b> UI tests...'
      failed_browser_count = RakeUtils.system_ 'bundle', 'exec', './runner.rb', '-d', 'test.learn.code.org'
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
