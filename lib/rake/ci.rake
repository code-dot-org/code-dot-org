require_relative '../../deployment'
require 'cdo/hip_chat'
require 'cdo/rake_utils'
require 'cdo/git_utils'

namespace :ci do
  desc 'Update Firebase configuration for this environment.'
  task firebase: ['firebase:ci']

  desc 'Synchronize the Chef cookbooks to the Chef repo for this environment using Berkshelf.'
  task :chef do
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

  task test: ['test:ci']

  tasks = []
  tasks << :chef
  tasks << :lint if CDO.lint
  tasks << 'build:chef'
  tasks << :build
  tasks << 'stack:ami:start'
  tasks << 'stack:start'
  task all: tasks
end

desc 'Update the server as part of continuous integration.'
task ci: ['ci:all']
