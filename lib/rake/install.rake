require_relative '../../deployment'
require 'cdo/rake_utils'

namespace :install do

  # Create a symlink in the public directory that points at the appropriate apps
  # code (either the static apps or the built version, depending on CDO.use_my_apps).
  task :apps_symlink do
    make_symlink('apps')
  end

  desc 'Install Git hooks.'
  task :hooks do
    files = [
      'pre-commit',
      'post-checkout',
      'post-merge',
    ]
    git_path = ".git/hooks"

    files.each do |f|
      path = File.expand_path("../tools/hooks/#{f}", __FILE__)
      RakeUtils.ln_s path, "#{git_path}/#{f}"
    end
  end

  task :apps do
    if RakeUtils.local_environment?
      RakeUtils.install_npm
    end
  end

  task :code_studio do
    if RakeUtils.local_environment?
      make_symlink('code_studio')
      update_package('code_studio')
      RakeUtils.install_npm
    end
  end

  desc 'Install Dashboard rubygems and setup database.'
  task :dashboard do
    if RakeUtils.local_environment?
      Dir.chdir(dashboard_dir) do
        RakeUtils.bundle_install
        puts CDO.dashboard_db_writer
        RakeUtils.rake 'dashboard:setup_db'
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
  tasks << :apps_symlink
  tasks << :apps if CDO.build_apps
  tasks << :code_studio if CDO.build_code_studio
  tasks << :dashboard if CDO.build_dashboard
  tasks << :pegasus if CDO.build_pegasus
  task :all => tasks

end
desc 'Install all OS dependencies.'
task :install => ['install:all']
