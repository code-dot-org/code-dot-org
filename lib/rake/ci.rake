require_relative '../../deployment'
require 'cdo/chat_client'
require 'cdo/rake_utils'
require 'cdo/git_utils'
require 'tempfile'

namespace :ci do
  # Synchronize the Chef cookbooks to the Chef repo for this environment using Berkshelf.
  task :chef_update do
    if CDO.chef_local_mode
      # Update local cookbooks from repository in local mode.
      ChatClient.log 'Updating local <b>chef</b> cookbooks...'
      RakeUtils.with_bundle_dir(cookbooks_dir) do
        Tempfile.open(['berks', '.tgz']) do |file|
          RakeUtils.bundle_exec "berks package #{file.path}"
          RakeUtils.sudo "tar xzf #{file.path} -C /var/chef"
        end
      end
    elsif CDO.daemon && CDO.chef_managed

      # Temporarily disable automatic chef cookbook updates for Ubuntu upgrade except for envs undergoing upgrade
      ChatClient.log('Updating Chef cookbooks...')
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

        ChatClient.log 'Applying <b>chef</b> profile...'
        RakeUtils.sudo Cdo::CloudFormation::CdoApp::CHEF_CLIENT_BIN
      end
    end
  end

  # Perform a normal local build by calling the top-level Rakefile.
  # Additionally run the lint task if specified for the environment.
  task build: [:chef_update] do
    Dir.chdir(deploy_dir) do
      ChatClient.wrap('rake lint') {Rake::Task['lint'].invoke} if CDO.lint
      ChatClient.wrap('rake build') {Rake::Task['build'].invoke}
    end
  end

  multitask deploy_multi: [:deploy_console, :deploy_stack]

  task :deploy_stack do
    ChatClient.wrap('CloudFormation stack update') do
      RakeUtils.system_stream_output 'QUIET=1 bundle exec rake stack:start' do |io|
        io.each do |line|
          line = "[stack update] #{line.chomp}"
          ChatClient.log line
          CDO.log.info(line) if CDO.hip_chat_logging
        end
      end
    end
  end

  task :deploy_console do
    if rack_env?(:production) && (console = CDO.app_servers['console'])
      upgrade_frontend 'console', console
    end
  end

  desc 'Publish a new tag and release to GitHub'
  task :publish_github_release do
    RakeUtils.system "bin/create-release --force"
    ChatClient.log '<a href="https://github.com/code-dot-org/code-dot-org/releases/latest">New release created</a>'
  rescue RuntimeError => e
    ChatClient.log 'Failed to create a new release.', color: 'red'
    ChatClient.log "/quote #{e.message}\n#{CDO.backtrace e}", message_format: 'text', color: 'red'
  end

  desc 'flush CDN and frontend caches'
  task :flush_cache do
    ChatClient.wrap('Flush cache') do
      RakeUtils.system "bin/flush_cache"
    end
  end

  all_tasks = []
  all_tasks << 'firebase:ci'
  all_tasks << :build
  all_tasks << :deploy_multi
  all_tasks << :flush_cache
  all_tasks << :publish_github_release if rack_env?(:production)
  task all: all_tasks

  task test: [
    :all,
    'test:ci'
  ]
end

desc 'Update the server as part of continuous integration.'
task :ci do
  # In the test environment, we want to build everything with tests. In most
  # other environments, we want to do a full build including server
  # redeployment, but in some environments (like the i18n server) we just want
  # to run the build with no other actions.
  desired_task =
    if ENV['CI_ONLY_BUILD']
      'ci:build'
    elsif rack_env?(:test)
      'ci:test'
    else
      'ci:all'
    end

  ChatClient.wrap('CI build', backtrace: true) {Rake::Task[desired_task].invoke}
end

# Returns true if upgrade succeeded, false if failed.
def upgrade_frontend(name, hostname)
  ChatClient.log "Upgrading <b>#{name}</b> (#{hostname})..."
  command = "sudo #{Cdo::CloudFormation::CdoApp::CHEF_CLIENT_BIN}"
  log_path = aws_dir "deploy-#{name}.log"
  begin
    RakeUtils.system "ssh -i ~/.ssh/deploy-id_rsa #{hostname} '#{command} 2>&1' >> #{log_path}"
    ChatClient.log "Upgraded <b>#{name}</b> (#{hostname})."
    true
  rescue RuntimeError
    ChatClient.log "<b>#{name}</b> (#{hostname}) failed to upgrade.", color: 'red'
    ChatClient.log "/quote #{File.read(log_path)}"
    false
  end
end
