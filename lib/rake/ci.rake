require_relative '../../deployment'
require 'cdo/hip_chat'
require 'cdo/rake_utils'
require 'cdo/git_utils'
require 'cdo/aws/cloudfront'
require 'tempfile'

namespace :ci do
  # Synchronize the Chef cookbooks to the Chef repo for this environment using Berkshelf.
  task :chef_update do
    if CDO.chef_local_mode
      # Update local cookbooks from repository in local mode.
      HipChat.log 'Updating local <b>chef</b> cookbooks...'
      RakeUtils.with_bundle_dir(cookbooks_dir) do
        Tempfile.open(['berks', '.tgz']) do |file|
          RakeUtils.bundle_exec "berks package #{file.path}"
          RakeUtils.sudo "tar xzf #{file.path} -C /var/chef"
        end
      end
    elsif CDO.daemon && CDO.chef_managed
      HipChat.log('Updating Chef cookbooks...')
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
      HipChat.log 'Applying <b>chef</b> profile...'
      RakeUtils.sudo 'chef-client'
    end
  end

  # Deploy updates to CloudFront in parallel with the local build to optimize total CI build time.
  multitask build_with_cloudfront: [:build, :cloudfront]

  # Update CloudFront distribution with any changes to the http cache configuration.
  # If there are changes to be applied, the update can take 15 minutes to complete.
  task :cloudfront do
    if CDO.daemon && CDO.chef_managed
      HipChat.wrap('Update CloudFront') do
        AWS::CloudFront.create_or_update
      end
    end
  end

  # Perform a normal local build by calling the top-level Rakefile.
  # Additionally run the lint task if specified for the environment.
  task build: [:chef_update] do
    Dir.chdir(deploy_dir) do
      HipChat.wrap('rake lint') { Rake::Task['lint'].invoke } if CDO.lint
      HipChat.wrap('rake build') { Rake::Task['build'].invoke }
    end
  end

  multitask deploy_multi: [:deploy_console, :deploy_stack]

  task :deploy_stack do
    HipChat.wrap('CloudFormation stack update') { RakeUtils.rake 'stack:start' }
  end

  task :deploy_console do
    if rack_env?(:production) && (console = CDO.app_servers['console'])
      upgrade_frontend 'console', console
    end
  end

  task all: [
    'firebase:ci',
    :build_with_cloudfront,
    :deploy_multi
  ]
  task test: [
    :all,
    'test:ci'
  ]
end

desc 'Update the server as part of continuous integration.'
task :ci do
  HipChat.wrap('CI build') { Rake::Task[rack_env?(:test) ? 'ci:test' : 'ci:all'].invoke }
end

# Returns true if upgrade succeeded, false if failed.
def upgrade_frontend(name, hostname)
  HipChat.log "Upgrading <b>#{name}</b> (#{hostname})..."
  command = 'sudo chef-client'
  log_path = aws_dir "deploy-#{name}.log"
  begin
    RakeUtils.system "ssh -i ~/.ssh/deploy-id_rsa #{hostname} '#{command} 2>&1' >> #{log_path}"
    HipChat.log "Upgraded <b>#{name}</b> (#{hostname})."
    true
  rescue RuntimeError
    HipChat.log "<b>#{name}</b> (#{hostname}) failed to upgrade.", color: 'red'
    HipChat.log "/quote #{File.read(log_path)}"
    false
  end
end
