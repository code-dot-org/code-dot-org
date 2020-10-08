require_relative '../../deployment'
require 'cdo/rake_utils'

namespace :install do
  desc 'Install Git hooks.'
  task :hooks do
    files = [
      'pre-commit',
      'post-commit',
      'post-checkout',
      'post-merge',
      'pre-push'
    ]
    git_path = ".git/hooks"

    files.each do |f|
      path = "../../tools/hooks/#{f}"
      RakeUtils.ln_s path, "#{git_path}/#{f}"
    end

    # Include custom `.gitconfig`.
    RakeUtils.system 'git config', '--local include.path ../.gitconfig'
  end

  desc 'Create default locals.yml file if it doesn\'t exist'
  task :locals_yml do
    config_file = deploy_dir('locals.yml')
    config_defaults = deploy_dir('locals.yml.default')
    unless File.exist?(config_file)
      RakeUtils.system 'cp', config_defaults, config_file
    end
  end

  task :apps do
    if RakeUtils.local_environment?
      RakeUtils.install_npm
    end
  end

  desc 'Install Dashboard rubygems and setup database.'
  task :dashboard do
    if RakeUtils.local_environment?
      Dir.chdir(dashboard_dir) do
        RakeUtils.bundle_install
        puts CDO.dashboard_db_writer
        if ENV['CI']
          # Prepare for dashboard unit tests to run. We can't seed UI test data
          # yet because doing so would break unit tests.
          RakeUtils.rake 'db:create db:test:prepare'
        else
          RakeUtils.rake_stream_output 'dashboard:setup_db', ([:adhoc, :development].include?(rack_env) ? '--trace' : nil)
        end
      end
    end
  end

  desc 'Install Pegasus rubygems and setup database.'
  task :pegasus do
    if RakeUtils.local_environment?
      Dir.chdir(pegasus_dir) do
        RakeUtils.bundle_install
        RakeUtils.rake 'pegasus:setup_db'
      end
    end
  end

  tasks = []
  tasks << :hooks if rack_env?(:development)
  tasks << :locals_yml if rack_env?(:development)
  tasks << :apps if CDO.build_apps
  tasks << :dashboard if CDO.build_dashboard
  tasks << :pegasus if CDO.build_pegasus
  task all: tasks
end
desc 'Install all OS dependencies.'
task install: ['install:all']
