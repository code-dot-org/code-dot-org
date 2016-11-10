require_relative '../../deployment'

# Rake tasks for asset packages.
namespace :package do
  BUILD_PACKAGE=%i[staging test].include?(rack_env)

  # Special package-specific configurations listed here.
  # TODO standardize these special cases on a common convention shared among all packages.
  PACKAGES = {
    apps: {
      target: apps_dir('build/package'),
      symlink_name: 'blockly'
    }
  }

  PACKAGES.keys.each do |package|
    namespace package do
      def package_dir
        method("#{package}_dir").call
      end

      def package_dash
        package.to_s.tr('_', '-')
      end

      def packager
        S3Packaging.new(package_dash, package_dir, dashboard_dir("public/#{package_dash}-package"))
      end

      desc "Update #{package} static asset package."
      task 'update' do
        require 'cdo/aws/s3_packaging'

        # never download if we build our own
        next if CDO["use_my_#{package_dash}"]

        unless packager.update_from_s3
          if BUILD_PACKAGE
            Rake::Task["#{package}:build"].invoke
          else
            raise "No valid #{package} package found"
          end
        end
      end

      desc "Build and test #{package} package and upload to S3."
      task 'build' do
        raise "Won't build #{package} with staged changes" if RakeUtils.git_staged_changes?(package_dir)
        HipChat.wrap("Building #{package}") { Rake::Task["build:#{package}"].invoke }
        HipChat.wrap("Testing #{package}") { Rake::Task["test:#{package}"].invoke }
        # upload to s3
        s3_packager = packager
        s3_package = s3_packager.upload_package_to_s3('/build/package')
        HipChat.log "Uploaded #{package} package to S3: #{s3_packager.commit_hash}"
        s3_packager.decompress_package(s3_package)
      end

      desc "Update Dashboard symlink for #{package} package."
      task 'symlink' do
        Dir.chdir(method("#{package}_dir").call) do
          target = CDO["use_my_#{package}"] ? PACKAGES[package][:target] : "#{package_dash}-package"
          RakeUtils.ln_s target, dashboard_dir('public', PACKAGES[package][:symlink_name])
        end
      end
    end
    desc "Update #{package} package and create Dashboard symlink."
    task(package => %w(update symlink).map{|x| "package:#{package}:#{x}"})
  end
end
desc "Update all packages (#{PACKAGES.keys.join(', ')})."
task package: PACKAGES.keys.map{|x| "package:#{x}"}
