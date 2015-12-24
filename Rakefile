# Run 'rake' or 'rake -P' to get a list of valid Rake commands.

require_relative './deployment'
require 'os'
require 'cdo/hip_chat'
require 'cdo/rake_utils'

namespace :lint do
  task :ruby do
    RakeUtils.bundle_exec 'rubocop'
  end

  task :haml do
    RakeUtils.bundle_exec 'haml-lint dashboard pegasus'
  end

  task :javascript do
    Dir.chdir(apps_dir) do
      # lint all js/jsx files in dashboardd/app/assets/javascript
      RakeUtils.system 'grunt jshint:files --glob "../dashboard/app/**/*.js*(x)"'
      # also do our standard apps lint
      RakeUtils.system 'grunt jshint'
    end
    Dir.chdir(shared_js_dir) do
      RakeUtils.system 'npm run lint'
    end
    Dir.chdir(code_studio_dir) do
      RakeUtils.system 'npm run lint:js -s'
    end
  end

  task all: [:ruby, :haml, :javascript]
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

      if rack_env?(:staging)
        HipChat.log 'Updating <b>apps</b> i18n strings...'
        RakeUtils.system './sync-apps.sh'
      end

      HipChat.log 'Building <b>apps</b>...'
      env_vars = ''
      env_vars += 'MOOC_LOCALIZE=1 ' if CDO.localize_apps
      env_vars += 'MOOC_DIGEST=1 ' unless rack_env?(:development)
      RakeUtils.system "#{env_vars} grunt"
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

  task :code_studio do
    Dir.chdir(code_studio_dir) do
      HipChat.log 'Installing <b>code-studio</b> dependencies...'
      RakeUtils.npm_install

      HipChat.log 'Building <b>code-studio</b>...'
      RakeUtils.system 'npm run build'
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
        RakeUtils.rake "honeybadger:deploy TO=#{rack_env} REVISION=`git rev-parse HEAD`"
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
          raise e
        end

        HipChat.log 'Seeding <b>pegasus</b>...'
        begin
          RakeUtils.rake 'seed:migrate'
        rescue => e
          HipChat.log "/quote #{e.message}\n#{CDO.backtrace e}", message_format: 'text'
          raise e
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
  tasks << :code_studio if CDO.build_code_studio
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
## install
##
##
##################################################################################################

# Whether this is a development or adhoc environment where we should install npm and create
# a local database.
def local_environment?
  (rack_env?(:development) && !CDO.chef_managed) || rack_env?(:adhoc)
end

def install_npm
  # Temporary workaround to play nice with nvm-managed npm installation.
  # See discussion of a better approach at https://github.com/code-dot-org/code-dot-org/pull/4946
  return if RakeUtils.system_('which npm') == 0

  if OS.linux?
    RakeUtils.system 'sudo apt-get install -y nodejs npm'
    RakeUtils.system 'sudo ln -s -f /usr/bin/nodejs /usr/bin/node'
    RakeUtils.system 'sudo npm install -g npm@2.9.1'
    RakeUtils.npm_install_g 'grunt-cli'
  elsif OS.mac?
    RakeUtils.system 'brew install node'
    RakeUtils.system 'npm', 'update', '-g', 'npm'
    RakeUtils.system 'npm', 'install', '-g', 'grunt-cli'
  end
end

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

  task :hooks do
    files = [
        'pre-commit',
        'post-checkout',
        'post-merge',
    ]
    git_path = ".git/hooks"

    files.each do |f|
      path = File.expand_path("../tools/hooks/#{f}", __FILE__)
      system "ln -s #{path} #{git_path}/#{f}"
    end
  end


  task :apps do
    if local_environment?
      install_npm
    end
  end

  task :shared do
    if local_environment?
      Dir.chdir(shared_js_dir) do
        shared_js_build = CDO.use_my_shared_js ? shared_js_dir('build/package') : 'shared-package'
        RakeUtils.ln_s shared_js_build, dashboard_dir('public','shared')
      end
      install_npm
    end
  end

  task :code_studio do
    if local_environment?
      Dir.chdir(code_studio_dir) do
        code_studio_build = CDO.use_my_code_studio ? code_studio_dir('build') : 'code-studio-package'
        RakeUtils.ln_s code_studio_build, dashboard_dir('public','code-studio')
      end
      install_npm
    end
  end

  task :dashboard do
    if local_environment?
      Dir.chdir(dashboard_dir) do
        RakeUtils.bundle_install
        puts CDO.dashboard_db_writer
        RakeUtils.rake 'dashboard:setup_db'
      end
    end
  end

  task :pegasus do
    if local_environment?
      Dir.chdir(pegasus_dir) do
        RakeUtils.bundle_install
        RakeUtils.rake 'pegasus:setup_db'
      end
    end
  end

  tasks = []
  #tasks << :blockly_core if CDO.build_blockly_core
  tasks << :blockly_symlink
  tasks << :apps if CDO.build_apps
  tasks << :shared if CDO.build_shared_js
  tasks << :code_studio if CDO.build_code_studio
  tasks << :dashboard if CDO.build_dashboard
  tasks << :pegasus if CDO.build_pegasus
  task :all => tasks

end
task :install => ['install:all']

# Commands to update built static asset packages
namespace :update_package do

  task :code_studio do
    if RakeUtils.git_staged_changes?
      puts 'You have changes staged for commit; please unstage all changes before running an `update_package` command.'
    else
      # Lint, Clean, Build, Test
      Dir.chdir(code_studio_dir) do
        RakeUtils.system "npm run lint && npm run clean && npm run build"
      end

      # Remove old built package
      package_dir = dashboard_dir('public', 'code-studio-package')
      RakeUtils.system "rm -rf #{package_dir}"

      # Copy in new built package
      RakeUtils.system "cp -r #{code_studio_dir('build')} #{package_dir}"

      # Commit directory
      RakeUtils.git_add '-A', package_dir
      RakeUtils.system 'git commit --no-verify -m "Updated code-studio-package."'
    end
  end

end

task :default do
  puts 'List of valid commands:'
  system 'rake -P'
end
