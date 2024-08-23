require_relative '../../deployment'
require 'cdo/chat_client'
require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

# Rake tasks for asset packages (currently only 'apps').
namespace :package do
  BUILD_PACKAGE = %i[staging test adhoc].include?(rack_env) && !ENV['CI']

  namespace :apps do
    def apps_packager
      S3Packaging.new('apps', apps_dir, dashboard_dir('public/apps-package'))
    end

    desc 'Update apps static asset package.'
    timed_task_with_logging 'update' do
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
    timed_task_with_logging 'build' do
      # Don't build apps if there are staged changes
      Rake::Task['circle:check_for_unexpected_apps_changes'].invoke

      # Store initial commit hash to make sure it doesn't change out from under us during the build
      packager = apps_packager
      expected_commit_hash = packager.commit_hash

      ChatClient.wrap('Building apps') {Rake::Task['build:apps'].invoke}

      unless rack_env?(:adhoc)
        # Check that building apps did not generate unexpected changes either.
        Rake::Task['circle:check_for_unexpected_apps_changes'].invoke

        ChatClient.wrap('Testing apps') {Rake::Task['test:apps'].invoke}
      end

      # upload to s3
      package = packager.create_package('/build/package', expected_commit_hash: expected_commit_hash)

      unless rack_env?(:adhoc)
        packager.upload_package_to_s3(package)
        ChatClient.log "Uploaded apps package to S3: #{packager.commit_hash}"
        apps_packager.log_bundle_size
      end

      packager.decompress_package(package)
    end

    desc 'Update Dashboard symlink for apps package.'
    timed_task_with_logging 'symlink' do
      Dir.chdir(apps_dir) do
        target = CDO.use_my_apps ? apps_dir('build/package') : 'apps-package'
        RakeUtils.ln_s target, dashboard_dir('public', 'blockly')
      end
    end
  end
  desc 'Update apps package and create Dashboard symlink.'
  timed_task_with_logging apps: ['apps:update', 'apps:symlink']
end
desc 'Update all packages (apps).'
timed_task_with_logging package: ['package:apps']
