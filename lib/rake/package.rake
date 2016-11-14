require_relative '../../deployment'

# Rake tasks for asset packages (currently only 'apps').
namespace :package do
  namespace :apps do
    desc 'Update apps static asset package.'
    task 'update' do
      require 'cdo/aws/s3_packaging'

      # never download if we build our own
      next if CDO.use_my_apps

      packager = S3Packaging.new('apps', apps_dir, dashboard_dir('public/apps-package'))
      package_found = packager.update_from_s3
      raise 'No valid apps package found' unless package_found
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
