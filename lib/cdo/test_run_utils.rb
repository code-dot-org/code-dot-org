require_relative './rake_utils'
require_relative '../../deployment'
require 'cdo/hip_chat'

module TestRunUtils
  def self.run_apps_tests
    Dir.chdir(apps_dir) do
      HipChat.wrap('apps tests') do
        RakeUtils.system 'npm run test-low-memory'
      end
    end
  end

  def self.run_local_ui_test
    feature_path = File.expand_path(ENV['feature'])
    Dir.chdir(dashboard_dir('test/ui/')) do
      RakeUtils.system "./runner.rb --verbose --pegasus=localhost.code.org:3000 --dashboard=localhost-studio.code.org:3000 --local --feature=#{feature_path}"
    end
  end

  def self.run_blockly_core_tests
    Dir.chdir(blockly_core_dir) do
      HipChat.wrap('blockly core tests') do
        RakeUtils.system './test.sh'
      end
    end
  end

  def self.run_dashboard_tests
    Dir.chdir(dashboard_dir) do
      HipChat.wrap('dashboard tests') do
        RakeUtils.system_stream_output "RAILS_ENV=#{rack_env}", "RACK_ENV=#{rack_env}", 'bundle', 'exec', 'rails', 'test'
      end
    end
  end

  def self.run_pegasus_tests
    Dir.chdir(pegasus_dir) do
      HipChat.wrap('pegasus tests') do
        RakeUtils.rake_stream_output 'test'
      end
    end
  end

  def self.run_shared_tests
    Dir.chdir(shared_dir) do
      HipChat.wrap('shared tests') do
        RakeUtils.rake_stream_output 'test'
      end
    end
  end

  def self.run_lib_tests
    Dir.chdir(lib_dir) do
      RakeUtils.rake_stream_output 'test'
    end
  end
end
