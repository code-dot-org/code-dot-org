# Run 'rake' or 'rake -P' to get a list of valid Rake commands.

require_relative './deployment'
require 'os'
require 'cdo/hip_chat'
require 'cdo/rake_utils'

def create_database(uri)
  db = URI.parse(uri)

  command = [
    'mysql',
    "--user=#{db.user}",
    "--host=#{db.host}",
  ]
  command << "--execute=\"CREATE DATABASE IF NOT EXISTS #{db.path[1..-1]}\""
  command << "--password=#{db.password}" unless db.password.nil?

  system command.join(' ')
end

##################################################################################################
##
##
## lint
##
##
##################################################################################################

namespace :lint do
  task :ruby do
    HipChat.log 'Linting ruby...'
    RakeUtils.system 'rubocop'
  end

  task :haml do
    HipChat.log 'Linting haml...'
    RakeUtils.system 'haml-lint dashboard pegasus'
  end
  
  task :apps do
    Dir.chdir(apps_dir) do
      HipChat.log 'Linting <b>apps</b>...'
      RakeUtils.system 'grunt jshint'
    end
  end

  task all: [:ruby, :haml, :apps]
end
task lint: ['lint:all']

##################################################################################################
##
##
## build
##
##
##################################################################################################

namespace :build do

  task :configure do
    if CDO.chef_managed
      HipChat.log 'Applying <b>chef</b> profile...'
      RakeUtils.sudo 'chef-client'
    end

    unless CDO.chef_managed
      Dir.chdir(aws_dir) do
        HipChat.log 'Installing <b>aws</b> bundle...'
        RakeUtils.bundle_install
      end
    end
  end

  task :blockly_core do
    Dir.chdir(blockly_core_dir) do
      RakeUtils.npm_install

      HipChat.log 'Building <b>blockly-core</b> debug...'
      RakeUtils.system './deploy.sh', 'debug'

      HipChat.log 'Building <b>blockly-core</b>...'
      RakeUtils.system './deploy.sh'
    end
  end

  task :core_and_apps_dev do
    Dir.chdir(blockly_core_dir) do
      RakeUtils.system './deploy.sh', 'debug'
    end
    Dir.chdir(apps_dir) do
      RakeUtils.system 'MOOC_DEV=1 grunt build'
    end
  end

  task :apps do
    Dir.chdir(apps_dir) do
      HipChat.log 'Installing <b>apps</b> dependencies...'
      RakeUtils.npm_install

      HipChat.log 'Updating <b>apps</b> i18n strings...'
      RakeUtils.system './sync-apps.sh'

      HipChat.log 'Building <b>apps</b>...'
      if CDO.localize_apps
        RakeUtils.system 'MOOC_LOCALIZE=1', 'grunt'
      else
        RakeUtils.system 'grunt'
      end
    end
  end

  task :shared do
    Dir.chdir(shared_js_dir) do
      HipChat.log 'Installing <b>shared js</b> dependencies...'
      RakeUtils.npm_install

      HipChat.log 'Building <b>shared js</b>...'
      RakeUtils.system 'npm run gulp'
    end
  end

  task :stop_varnish do
    Dir.chdir(aws_dir) do
      unless rack_env?(:development) || (RakeUtils.system_('ps aux | grep -v grep | grep varnishd -q') != 0)
        HipChat.log 'Stopping <b>varnish</b>...'
        RakeUtils.stop_service 'varnish'
      end
    end
  end

  task :dashboard do
    Dir.chdir(dashboard_dir) do
      HipChat.log 'Stopping <b>dashboard</b>...'
      RakeUtils.stop_service CDO.dashboard_unicorn_name unless rack_env?(:development)

      HipChat.log 'Installing <b>dashboard</b> bundle...'
      RakeUtils.bundle_install

      if CDO.daemon
        HipChat.log 'Migrating <b>dashboard</b> database...'
        RakeUtils.rake 'db:migrate'

        HipChat.log 'Seeding <b>dashboard</b>...'
        RakeUtils.rake 'seed:all'
      end

      unless rack_env?(:development)
        HipChat.log 'Precompiling <b>dashboard</b> assets...'
        RakeUtils.rake 'assets:precompile'
      end

      HipChat.log 'Starting <b>dashboard</b>.'
      RakeUtils.start_service CDO.dashboard_unicorn_name unless rack_env?(:development)

      if rack_env?(:production)
        RakeUtils.system 'rake', "honeybadger:deploy TO=#{rack_env} REVISION=`git rev-parse HEAD`"
      end
    end
  end

  task :pegasus do
    Dir.chdir(pegasus_dir) do
      HipChat.log 'Stopping <b>pegasus</b>...'
      RakeUtils.stop_service CDO.pegasus_unicorn_name unless rack_env?(:development)

      HipChat.log 'Installing <b>pegasus</b> bundle...'
      RakeUtils.bundle_install

      if CDO.daemon
        HipChat.log 'Migrating <b>pegasus</b> database...'
        begin
          RakeUtils.rake 'db:migrate'
        rescue => e
          HipChat.log "/quote #{e.message}\n#{CDO.backtrace e}", message_format: 'text'
        end

        HipChat.log 'Seeding <b>pegasus</b>...'
        begin
          RakeUtils.rake 'seed:migrate'
        rescue => e
          HipChat.log "/quote #{e.message}\n#{CDO.backtrace e}", message_format: 'text'
        end
      end

      if CDO.daemon && !rack_env?(:development)
        HipChat.log 'Analyzing <b>pegasus</b> hour-of-code activity...'
        RakeUtils.system deploy_dir('bin', 'analyze_hoc_activity')
      end

      HipChat.log 'Starting <b>pegasus</b>.'
      RakeUtils.start_service CDO.pegasus_unicorn_name unless rack_env?(:development)
    end
  end

  task :start_varnish do
    Dir.chdir(aws_dir) do
      unless rack_env?(:development) || (RakeUtils.system_('ps aux | grep -v grep | grep varnishd -q') == 0)
        HipChat.log 'Starting <b>varnish</b>...'
        RakeUtils.start_service 'varnish'
      end
    end
  end

  tasks = []
  tasks << :configure
  tasks << :blockly_core if CDO.build_blockly_core
  tasks << :apps if CDO.build_apps
  tasks << :shared if CDO.build_shared_js
  tasks << :stop_varnish if CDO.build_dashboard || CDO.build_pegasus
  tasks << :dashboard if CDO.build_dashboard
  tasks << :pegasus if CDO.build_pegasus
  tasks << :start_varnish if CDO.build_dashboard || CDO.build_pegasus
  task :all => tasks

end
task :build => ['build:all']


##################################################################################################
##
##
## test
##
##
##################################################################################################

namespace :test do

  task :apps do
    Dir.chdir(apps_dir) do
      HipChat.log 'Installing <b>apps</b> dependencies...'
      RakeUtils.npm_install

      HipChat.log 'Testing <b>apps</b>...'
      RakeUtils.system 'grunt mochaTest'
    end
  end

  task :blockly_core do
    Dir.chdir(blockly_core_dir) do
      HipChat.log 'Installing <b>blockly-core</b> dependencies...'
      RakeUtils.npm_install

      HipChat.log 'Testing <b>blockly-core</b>...'
      RakeUtils.system './test.sh'
    end
  end

  task :dashboard do
    Dir.chdir(dashboard_dir) do
      HipChat.log 'Testing <b>dashboard</b>...'
      RakeUtils.system 'rake test'
    end
  end

  task :pegasus do
    Dir.chdir(pegasus_dir) do
      HipChat.log 'Testing <b>pegasus</b>...'
      RakeUtils.system 'rake test'
    end
  end

  task all: [:apps, :blockly_core, :dashboard, :pegasus]
end
task :test => ['test:all']


##################################################################################################
##
##
## install
##
##
##################################################################################################

namespace :install do

  # Create a symlink in the public directory that points at the appropriate blockly
  # code (either the static blockly or the built version, depending on CDO.use_my_apps).
  task :blockly_symlink do
    if rack_env?(:development) && !CDO.chef_managed
      Dir.chdir(apps_dir) do
        apps_build = CDO.use_my_apps ? apps_dir('build/package') : 'apps-package'
        RakeUtils.ln_s apps_build, dashboard_dir('public','blockly')
      end
    end
  end

  task :apps do
    if rack_env?(:development) && !CDO.chef_managed
      if OS.linux?
        RakeUtils.npm_update_g 'npm'
        RakeUtils.npm_install_g 'grunt-cli'
      elsif OS.mac?
        RakeUtils.system 'brew install node'
        RakeUtils.system 'npm', 'update', '-g', 'npm'
        RakeUtils.system 'npm', 'install', '-g', 'grunt-cli'
      end
    end
  end

  task :shared do
    if rack_env?(:development) && !CDO.chef_managed
      Dir.chdir(shared_js_dir) do
        shared_js_build = CDO.use_my_shared_js ? shared_js_dir('build/package') : 'shared-package'
        RakeUtils.ln_s shared_js_build, dashboard_dir('public','shared')
      end

      if OS.linux?
        RakeUtils.npm_update_g 'npm'
        RakeUtils.npm_install_g 'grunt-cli'
      elsif OS.mac?
        RakeUtils.system 'brew install node'
        RakeUtils.system 'npm', 'update', '-g', 'npm'
        RakeUtils.system 'npm', 'install', '-g', 'grunt-cli'
      end
    end
  end

  task :dashboard do
    if rack_env?(:development) && !CDO.chef_managed
      Dir.chdir(dashboard_dir) do
        RakeUtils.bundle_install
        puts CDO.dashboard_db_writer
        RakeUtils.rake 'db:setup_or_migrate'
        RakeUtils.rake 'seed:all'
      end
    end
  end

  task :pegasus do
    if rack_env?(:development) && !CDO.chef_managed
      Dir.chdir(pegasus_dir) do
        RakeUtils.bundle_install
        create_database CDO.pegasus_db_writer
        RakeUtils.rake 'db:migrate'
        RakeUtils.rake 'seed:migrate'
      end
    end
  end

  tasks = []
  #tasks << :blockly_core if CDO.build_blockly_core
  tasks << :blockly_symlink
  tasks << :apps if CDO.build_apps
  tasks << :shared if CDO.build_shared_js
  tasks << :dashboard if CDO.build_dashboard
  tasks << :pegasus if CDO.build_pegasus
  task :all => tasks

end
task :install => ['install:all']


##################################################################################################
##
## travis - only for TravisCI
##
##################################################################################################

namespace :travis
  task :setup do
    Dir.chdir(dashboard_dir) do
      RakeUtils.system 'rake -t db:create db:schema:load'
    end
  end
end
task :travis => ['travis:setup', :lint, :test]

task :default do
  puts 'List of valid commands:'
  system 'rake -P'
end
