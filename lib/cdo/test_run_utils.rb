require_relative './rake_utils'
require_relative '../../deployment'
require 'cdo/chat_client'

module TestRunUtils
  def self.run_apps_tests
    Dir.chdir(apps_dir) do
      ChatClient.wrap('apps tests') do
        RakeUtils.system_stream_output 'CHEAP=1 npm run test-low-memory'
      end
    end
  end

  def self.run_interpreter_tests
    Dir.chdir(apps_dir) do
      ChatClient.wrap('interpreter tests') do
        RakeUtils.system './test/interpreter/test-on-circle.sh'
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
      ChatClient.wrap('blockly core tests') do
        RakeUtils.system './test.sh'
      end
    end
  end

  def self.run_dashboard_tests(parallel: false)
    Dir.chdir(dashboard_dir) do
      ChatClient.wrap('dashboard tests') do
        if parallel
          RakeUtils.rake_stream_output 'parallel:test'
        else
          RakeUtils.system_stream_output "RAILS_ENV=#{rack_env}", "RACK_ENV=#{rack_env}", 'bundle', 'exec', 'rails', 'test'
        end
      end
    end
  end

  def self.run_pegasus_tests
    Dir.chdir(pegasus_dir) do
      ChatClient.wrap('pegasus tests') do
        RakeUtils.rake_stream_output 'test'
      end
    end
  end

  def self.run_shared_tests
    Dir.chdir(shared_dir) do
      ChatClient.wrap('shared tests') do
        RakeUtils.rake_stream_output 'test'
      end
    end
  end

  def self.run_lib_tests
    Dir.chdir(lib_dir) do
      ChatClient.wrap('lib tests') do
        RakeUtils.rake_stream_output 'test'
      end
    end
  end
end
