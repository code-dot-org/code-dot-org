# Rake tasks for asset packages.
namespace :package do
  # Special package-specific configurations listed here.
  # TODO standardize these special cases on a common convention shared among all packages.
  PACKAGES = {
    apps: {
      target: apps_dir('build/package'),
      symlink_name: 'blockly'
    },
    code_studio: {
      target: code_studio_dir('build'),
      symlink_name: 'code-studio'
    }
  }

  PACKAGES.keys.each do |package|
    namespace package do
      desc "Update #{package} static asset package."
      task 'update' do
        require 'cdo/aws/s3_packaging'

        package_dash = package.to_s.gsub('_', '-')
        # never download if we build our own
        next if CDO["use_my_#{package}"]

        packager = S3Packaging.new(package_dash, method("#{package}_dir").call, dashboard_dir("public/#{package_dash}-package"))
        package_found = packager.update_from_s3
        raise 'No valid package found' unless package_found
      end
      desc "Update Dashboard symlink for #{package} package."
      task 'symlink' do
        package_dash = package.to_s.gsub('_', '-')
        Dir.chdir(method("#{package}_dir").call) do
          target = CDO["use_my_#{package}"] ? PACKAGES[package][:target] : "#{package_dash}-package"
          RakeUtils.ln_s target, dashboard_dir('public', PACKAGES[package][:symlink_name])
        end
      end
    end
    desc "Update #{package} package and create Dashboard symlink."
    task(package => %w(update symlink).map{|x|"package:#{package}:#{x}"})
  end
end
desc "Update all packages (#{PACKAGES.keys.join(', ')})."
task package: PACKAGES.keys.map{|x|"package:#{x}"}
