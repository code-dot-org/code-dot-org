# Run 'rake' or 'rake -P' to get a list of valid Rake commands.

require_relative './deployment'
require 'os'
require 'cdo/hip_chat'
require 'cdo/test_run_utils'
require 'cdo/rake_utils'
require 'cdo/aws/s3_packaging'

# Helper functions
def make_blockly_symlink
  Dir.chdir(apps_dir) do
    apps_build = CDO.use_my_apps ? apps_dir('build/package') : 'apps-package'
    RakeUtils.ln_s apps_build, dashboard_dir('public','blockly')
  end
end

def make_code_studio_symlink
  Dir.chdir(code_studio_dir) do
    code_studio_build = CDO.use_my_code_studio ? code_studio_dir('build') : 'code-studio-package'
    RakeUtils.ln_s code_studio_build, dashboard_dir('public','code-studio')
  end
end

namespace :lint do
  task :ruby do
    RakeUtils.bundle_exec 'rubocop'
  end

  task :haml do
    RakeUtils.bundle_exec 'haml-lint dashboard pegasus'
  end

  task :javascript do
    Dir.chdir(apps_dir) do
      HipChat.log 'Linting <b>apps</b> JavaScript...'
      # lint all js/jsx files in dashboardd/app/assets/javascript
      RakeUtils.system './node_modules/.bin/eslint -c .eslintrc.js ../dashboard/app/ --ext .js,.jsx'
      # also do our standard apps lint
      RakeUtils.system 'npm run lint'
    end
    Dir.chdir(code_studio_dir) do
      HipChat.log 'Linting <b>code-studio</b> JavaScript...'
      RakeUtils.system 'npm run lint-js'
    end
  end

  task all: [:ruby, :haml, :javascript]
end
task lint: ['lint:all']

def run_tests_if_changed(identifier, changed_globs)
  branch_base = 'staging'
  if RakeUtils.changed_in_branch_or_local?(branch_base, changed_globs)
    HipChat.log "Files affecting tests *modified* from #{branch_base}. Starting tests for: #{identifier} "
    yield
  else
    HipChat.log "Files affecting tests unmodified from #{branch_base}. Skipping tests for: #{identifier} "
  end
end

namespace :circle do
  task :run_tests, [:force_all_tests_tag] do |_, args|
    run_all_tests_tag = args[:force_all_tests_tag]
    if RakeUtils.circle_commit_contains(run_all_tests_tag)
      HipChat.log "Commit message: '#{RakeUtils.circle_commit_message}' contains #{run_all_tests_tag}, force-running all tests."
      RakeUtils.rake 'test:all'
    else
      RakeUtils.rake 'test:changed'
    end
  end

  task :run_ui_tests, [:force_tests_commit_tag] do |_, args|
    run_ui_tests_tag = args[:force_tests_commit_tag]
    if RakeUtils.circle_commit_contains(run_ui_tests_tag)
      HipChat.log "Commit message: '#{RakeUtils.circle_commit_message}' contains #{run_ui_tests_tag}, running UI tests."
      RakeUtils.exec_in_background 'RACK_ENV=test RAILS_ENV=test ./bin/dashboard-server'
      RakeUtils.system_stdout 'wget https://saucelabs.com/downloads/sc-latest-linux.tar.gz'
      RakeUtils.system_stdout 'tar -xzf sc-latest-linux.tar.gz'
      Dir.chdir(Dir.glob('sc-*-linux')[0]) do
        RakeUtils.exec_in_background './bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY'
      end
      RakeUtils.system_stdout 'until $(curl --output /dev/null --silent --head --fail http://localhost.studio.code.org:3000); do sleep 5; done'
      Dir.chdir('dashboard/test/ui') do
        RakeUtils.system_stdout 'bundle exec ./runner.rb -c ChromeLatestWin7 -p localhost.code.org:3000 -d localhost.studio.code.org:3000 --circle --parallel 4 --retry_count 4 --html'
      end
    else
      HipChat.log "Commit message: '#{RakeUtils.circle_commit_message}' does not contain #{run_ui_tests_tag}, skipping UI tests."
    end
  end
end

namespace :test do
  task :apps do
    TestRunUtils.run_apps_tests
  end

  task :code_studio do
    TestRunUtils.run_code_studio_tests
  end

  task :blockly_core do
    TestRunUtils.run_blockly_core_tests
  end

  task :dashboard do
    TestRunUtils.run_dashboard_tests
  end

  task :pegasus do
    TestRunUtils.run_pegasus_tests
  end

  task :shared do
    TestRunUtils.run_shared_tests
  end

  namespace :changed do
    task :apps do
      run_tests_if_changed('apps',
                           ['apps/*',
                            'blockly-core/*',
                            'shared/*.js',
                            'shared/*.css']) do
        TestRunUtils.run_apps_tests
      end
    end

    task :code_studio do
      run_tests_if_changed('code-studio', ['code-studio/*']) do
        TestRunUtils.run_code_studio_tests
      end
    end

    task :blockly_core do
      run_tests_if_changed('blockly-core', ['blockly-core/*']) do
        TestRunUtils.run_blockly_core_tests
      end
    end

    task :dashboard do
      run_tests_if_changed('dashboard', ['dashboard/*', 'lib/*', 'shared/*']) do
        TestRunUtils.run_dashboard_tests
      end
    end

    task :pegasus do
      run_tests_if_changed('pegasus', ['pegasus/*', 'lib/*', 'shared/*']) do
        TestRunUtils.run_pegasus_tests
      end
    end

    task :shared do
      run_tests_if_changed('shared', ['shared/*']) do
        TestRunUtils.run_shared_tests
      end
    end

    task all: [:apps, :code_studio, :blockly_core, :dashboard, :pegasus, :shared]
  end

  task changed: ['changed:all']

  task all: [:apps, :code_studio, :blockly_core, :dashboard, :pegasus, :shared]
end
task test: ['test:changed']

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
    Dir.chdir(apps_dir) do
      RakeUtils.system './build_with_core.sh debug'
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
      env_vars = CDO.localize_apps ? 'MOOC_LOCALIZE=1' : ''
      npm_target = rack_env?(:development) ? 'build' : 'build:dist'
      RakeUtils.system "#{env_vars} npm run #{npm_target}"
    end
  end

  task :code_studio do
    Dir.chdir(code_studio_dir) do
      HipChat.log 'Installing <b>code-studio</b> dependencies...'
      RakeUtils.npm_install

      HipChat.log 'Building <b>code-studio</b>...'
      RakeUtils.system 'npm run build:dist'
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
    make_blockly_symlink
    make_code_studio_symlink
    # Make sure we have an up to date package for apps and code studio
    ensure_apps_package
    ensure_code_studio_package

    Dir.chdir(dashboard_dir) do
      HipChat.log 'Stopping <b>dashboard</b>...'
      RakeUtils.stop_service CDO.dashboard_unicorn_name unless rack_env?(:development)

      HipChat.log 'Installing <b>dashboard</b> bundle...'
      RakeUtils.bundle_install

      if CDO.daemon
        HipChat.log 'Migrating <b>dashboard</b> database...'
        RakeUtils.rake 'db:migrate'

        # Update the schema cache file, except for production which always uses the cache.
        schema_cache_file = dashboard_dir('db/schema_cache.dump')
        unless rack_env?(:production)
          RakeUtils.rake 'db:schema:cache:dump'
          if RakeUtils.file_changed_from_git?(schema_cache_file)
            # Staging is responsible for committing the authoritative schema cache dump.
            if rack_env?(:staging)
              RakeUtils.system 'git', 'add', schema_cache_file
              HipChat.log 'Committing updated schema_cache.dump file...', color: 'purple'
              RakeUtils.system 'git', 'commit', '-m', '"Update schema cache dump after schema changes."', schema_cache_file
              RakeUtils.git_push
            # The schema dump from the test database should always match that generated by staging.
            elsif rack_env?(:test)
              raise 'Unexpected database schema difference between staging and test'
            end
          end
        end

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

# Whether this is a local or adhoc environment where we should install npm and create
# a local database.
def local_environment?
  (rack_env?(:development, :test) && !CDO.chef_managed) || rack_env?(:adhoc)
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

def ensure_code_studio_package
  # never download if we build our own
  return if CDO.use_my_code_studio

  packager = S3Packaging.new('code-studio', code_studio_dir, dashboard_dir('public/code-studio-package'))
  package_found = packager.update_from_s3
  raise "No valid package found" unless package_found
end

def ensure_apps_package
  # never download if we build our own
  return if CDO.use_my_apps

  packager = S3Packaging.new('apps', apps_dir, dashboard_dir('public/apps-package'))
  package_found = packager.update_from_s3
  raise "No valid package found" unless package_found
end

namespace :install do

  # Create a symlink in the public directory that points at the appropriate blockly
  # code (either the static blockly or the built version, depending on CDO.use_my_apps).
  task :blockly_symlink do
    make_blockly_symlink
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
      RakeUtils.ln_s path, "#{git_path}/#{f}"
    end
  end

  task :apps do
    if local_environment?
      install_npm
    end
  end

  task :code_studio do
    if local_environment?
      make_code_studio_symlink
      ensure_code_studio_package
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
  tasks << :hooks if rack_env?(:development)
  tasks << :blockly_symlink
  tasks << :apps if CDO.build_apps
  tasks << :code_studio if CDO.build_code_studio
  tasks << :dashboard if CDO.build_dashboard
  tasks << :pegasus if CDO.build_pegasus
  task :all => tasks

end
task :install => ['install:all']

# Commands to update built static asset packages
namespace :update_package do

  task :code_studio do
    ensure_code_studio_package
  end

  task :apps do
    ensure_apps_package
  end

end

task :default do
  puts 'List of valid commands:'
  system 'rake -P'
end
