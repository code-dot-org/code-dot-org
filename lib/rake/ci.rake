require_relative '../../deployment'
require 'cdo/chat_client'
require 'cdo/rake_utils'
require 'cdo/git_utils'
require 'cdo/aws/cloudfront'
require 'tempfile'
require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

namespace :ci do
  # Synchronize the Chef cookbooks to the Chef repo for this environment using Berkshelf.
  timed_task_with_logging :chef_update do
    # Ensure Chef Client is using an up to date TLS/SSL root certificate store from a trusted source (Mozilla via curl.se)
    Dir.chdir(cookbooks_dir) do
      ROOT_CERTIFICATE_URL = "https://raw.githubusercontent.com/code-dot-org/code-dot-org/#{GitUtils.current_branch}/cookbooks/cacert.pem"
      RakeUtils.sudo "curl -o /opt/chef/embedded/ssl/certs/cacert.pem #{ROOT_CERTIFICATE_URL}"
    end
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
        RakeUtils.sudo '/opt/chef/bin/chef-client --chef-license accept-silent'
      end
    end
  end

  # Perform a normal local build by calling the top-level Rakefile.
  # Additionally run the lint task if specified for the environment.
  timed_task_with_logging build: [:chef_update] do
    Dir.chdir(deploy_dir) do
      ChatClient.wrap('rake lint') {Rake::Task['lint'].invoke} if CDO.lint
      ChatClient.wrap('rake build') {Rake::Task['build'].invoke}
    end
  end

  multitask deploy_multi: [:deploy_console, :deploy_stack]

  timed_task_with_logging :deploy_stack do
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

  timed_task_with_logging :deploy_console do
    if rack_env?(:production) && (console = CDO.app_servers['console'])
      upgrade_frontend 'console', console
    end
  end

  desc 'Publish a new tag and release to GitHub'
  timed_task_with_logging :publish_github_release do
    RakeUtils.system "bin/create-release --force"
    ChatClient.log '<a href="https://github.com/code-dot-org/code-dot-org/releases/latest">New release created</a>'
  rescue RuntimeError => exception
    ChatClient.log 'Failed to create a new release.', color: 'red'
    ChatClient.log "/quote #{exception.message}\n#{CDO.backtrace exception}", message_format: 'text', color: 'red'
  end

  desc 'flush Content Distribution Network (CDN) caches'
  timed_task_with_logging :flush_cloudfront_cache do
    ChatClient.wrap('Flush cache') do
      AWS::CloudFront.invalidate_caches
    end
  end

  all_tasks = []
  all_tasks << :build
  all_tasks << :deploy_multi
  all_tasks << :flush_cloudfront_cache
  all_tasks << :publish_github_release if rack_env?(:production)
  timed_task_with_logging all: all_tasks

  timed_task_with_logging test: [
    :all,
    'test:ci'
  ]
end

desc 'Update the server as part of continuous integration.'
timed_task_with_logging :ci do
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
  command = 'sudo /opt/chef/bin/chef-client --chef-license accept-silent'
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
