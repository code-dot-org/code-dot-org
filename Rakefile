require_relative './deployment'
require 'cdo/hip_chat'
require 'cdo/rake_utils'

def with_retries(count=5)
  begin
    yield if block_given?
  rescue
    raise if (count -= 1) == 0
    sleep 2.25
  end
end


##################################################################################################
##
##
## build
##
##
##################################################################################################

namespace :build do

  task :configure do
    Dir.chdir(aws_dir) do
      HipChat.log 'Installing <b>aws</b> bundle...'
      RakeUtils.bundle_install

      HipChat.log 'Configuring <b>aws</b>...'
      RakeUtils.rake
    end
  end

  task :blockly_core do
    Dir.chdir(blockly_core_dir) do
      HipChat.log 'Building <b>blockly-core</b> debug...'
      RakeUtils.system './deploy.sh', 'debug'

      HipChat.log 'Building <b>blockly-core</b>...'
      RakeUtils.system './deploy.sh'
    end
  end

  task :blockly do
    Dir.chdir(blockly_dir) do
      HipChat.log 'Installing <b>blockly</b> dependencies...'
      RakeUtils.npm_install

      HipChat.log 'Building <b>blockly</b>...'
      if CDO.localize_blockly
        RakeUtils.system 'MOOC_LOCALIZE=1', 'grunt'
      else
        RakeUtils.system 'grunt'
      end
    end
  end

  task :dashboard do
    Dir.chdir(dashboard_dir) do
      HipChat.log 'Stopping <b>dashboard</b>...'
      RakeUtils.stop_service CDO.dashboard_unicorn_name unless rack_env?(:development)

      HipChat.log 'Installing <b>dashboard</b> bundle...'
      RakeUtils.bundle_install

      if CDO.daemon || rack_env?(:levelbuilder)
        RakeUtils.rake 'db:create' unless rack_env?(:production)

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

      # report deployment to honeybadger
      RakeUtils.system 'rake', "honeybadger:deploy TO=#{rack_env} REVISION=`git rev-parse HEAD`"
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
        with_retries { RakeUtils.rake 'db:migrate' }

        HipChat.log 'Seeding <b>pegasus</b>...'
        with_retries { RakeUtils.rake 'seed:migrate' }
      end

      if CDO.daemon && !rack_env?(:development)
        HipChat.log 'Analyzing <b>pegasus</b> hour-of-code activity...'
        RakeUtils.system 'sites.v3/code.org/bin/analyze_hoc_activity'
      end

      HipChat.log 'Starting <b>pegasus</b>.'
      RakeUtils.start_service CDO.pegasus_unicorn_name unless rack_env?(:development)
    end
  end

  task :varnish do
    Dir.chdir(aws_dir) do
      unless rack_env?(:development)
        HipChat.log 'Restarting <b>varnish</b>...'
        RakeUtils.stop_service 'varnish'
        RakeUtils.start_service 'varnish'
      end
    end
  end

  tasks = []
  tasks << :configure
  tasks << :blockly_core if CDO.build_blockly_core
  tasks << :blockly if CDO.build_blockly
  tasks << :dashboard if CDO.build_dashboard
  tasks << :pegasus if CDO.build_pegasus
  tasks << :varnish
  task :all => tasks

end
task :build => ['build:all']




##################################################################################################
##
##
## production - tasks related to the production instances
##
##
##################################################################################################

namespace :production do

  namespace :varnish do

    task :upgrade do
      CDO.varnish_instances.each do |host|
        begin
          remote_command = [
            'cd production/aws',
            'git pull',
            'bundle',
            'touch Rakefile',
            'rake',
            'cd ..',
            'rake build:varnish',
          ].join('; ')
          RakeUtils.system 'ssh', host, "'#{remote_command} 2>&1'"
        rescue
          puts "Unable to update #{host}!"
        end
      end
    end

    task :restart do
      CDO.varnish_instances.each do |host|
        remote_command = [
          'sudo service varnish stop',
          'sudo service varnish start',
        ].join('; ')
        RakeUtils.system 'ssh', host, "'#{remote_command} 2>&1'"
      end
    end

  end

end




##################################################################################################
##
##
## install
##
##
##################################################################################################

namespace :install do

  task :dashboard do
    unless CDO.chef_managed
      Dir.chdir(aws_dir) { RakeUtils.rake }
      Dir.chdir(dashboard_dir) do
        RakeUtils.bundle_install
        unless rack_env?(:production)
          RakeUtils.rake 'db:create'
          RakeUtils.rake 'db:schema:load'
        end
        RakeUtils.sudo_ln_s dashboard_dir('config/init.d'), File.join('/etc/init.d', CDO.dashboard_unicorn_name)
        RakeUtils.sudo 'update-rc.d', CDO.dashboard_unicorn_name, 'defaults'
        RakeUtils.sudo_ln_s dashboard_dir('config/logrotate'), File.join('/etc/logrotate.d', CDO.dashboard_unicorn_name)
        RakeUtils.sudo 'service', CDO.dashboard_unicorn_name, 'start'
      end
    end
  end

  task :pegasus do
    unless CDO.chef_managed
      Dir.chdir(aws_dir) { RakeUtils.rake }
      Dir.chdir(pegasus_dir) do
        RakeUtils.bundle_install
        unless rack_env?(:production)
          RakeUtils.system 'echo', "'CREATE DATABASE IF NOT EXISTS #{CDO.pegasus_db_name}'", '|', 'mysql', '-uroot'
          RakeUtils.rake 'db:migrate'
          RakeUtils.rake 'seed:migrate'
        end
        RakeUtils.sudo_ln_s dashboard_dir('config/init.d'), File.join('/etc/init.d', CDO.pegasus_unicorn_name)
        RakeUtils.sudo 'update-rc.d', CDO.pegasus_unicorn_name, 'defaults'
        RakeUtils.sudo 'service', CDO.pegasus_unicorn_name, 'start'
      end
    end
  end

  tasks = []
  #tasks << :blockly_core if CDO.build_blockly_core
  #tasks << :blockly if CDO.build_blockly
  tasks << :dashboard if CDO.build_dashboard
  tasks << :pegasus if CDO.build_pegasus
  task :all => tasks

end
task :install => ['install:all']
