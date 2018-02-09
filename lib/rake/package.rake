require_relative '../../deployment'
require 'cdo/chat_client'
require 'cdo/aws/s3_packaging'

# Rake tasks for asset packages (currently only 'apps').
namespace :package do
  BUILD_PACKAGE = %i[staging test adhoc].include?(rack_env) && !ENV['CI']

  namespace :apps do
    def apps_packager
      S3Packaging.new('apps', apps_dir, dashboard_dir('public/apps-package'))
    end

    desc 'Update apps static asset package.'
    task 'update' do
      # never download if we build our own and we're not building a package ourselves.
      next if CDO.use_my_apps && !BUILD_PACKAGE

      unless apps_packager.update_from_s3
        if BUILD_PACKAGE
          Rake::Task['package:apps:build'].invoke
        else
          raise 'No valid apps package found'
        end
      end
    end

    desc 'Build and test apps package and upload to S3.'
    task 'build' do
      # Don't build apps if there are staged changes
      Rake::Task['circle:check_for_unexpected_apps_changes'].invoke

      ChatClient.wrap('Building apps') {Rake::Task['build:apps'].invoke}

      # Check that building apps did not generate unexpected changes either.
      Rake::Task['circle:check_for_unexpected_apps_changes'].invoke

      ChatClient.wrap('Testing apps') {Rake::Task['test:apps'].invoke}

      # upload to s3
      packager = apps_packager
      package = packager.upload_package_to_s3('/build/package')
      ChatClient.log "Uploaded apps package to S3: #{packager.commit_hash}"
      packager.decompress_package(package)
    end

    desc 'Update Dashboard symlink for apps package.'
    task 'symlink' do
      Dir.chdir(apps_dir) do
        target = CDO.use_my_apps ? apps_dir('build/package') : 'apps-package'
        RakeUtils.ln_s target, dashboard_dir('public', 'blockly')
      end
    end
  end
  desc 'Update apps package and create Dashboard symlink.'
  task apps: ['apps:update', 'apps:symlink']
end
desc 'Update all packages (apps).'
task package: ['package:apps']
