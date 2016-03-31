# Run 'rake' or 'rake -D' to get a list of valid Rake commands with descriptions.

require_relative './deployment'
require 'os'
require 'cdo/hip_chat'
require 'cdo/rake_utils'
require 'cdo/aws/s3_packaging'
%w(adhoc install build).each{|rake| import "lib/rake/#{rake}.rake"}

# Helper functions
def make_apps_symlink
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
  desc 'Lints Ruby code with rubocop.'
  task :ruby do
    RakeUtils.bundle_exec 'rubocop'
  end

  desc 'Lints Haml code with haml-lint.'
  task :haml do
    RakeUtils.bundle_exec 'haml-lint dashboard pegasus'
  end

  desc 'Lints JavaScript code.'
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
desc 'Lints all code.'
task lint: ['lint:all']

import 'lib/rake/build.rake'

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

namespace :update_package do

  desc 'update code-studio static asset package'
  task :code_studio do
    ensure_code_studio_package
  end

  desc 'update apps static asset package'
  task :apps do
    ensure_apps_package
  end

end

task :default do
  puts 'List of valid commands:'
  system 'rake -T'
end
