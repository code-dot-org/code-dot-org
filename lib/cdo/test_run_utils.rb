require_relative './rake_utils'
require_relative '../../deployment'
require 'cdo/chat_client'

module TestRunUtils
  def self.run_apps_tests
    Dir.chdir(apps_dir) do
      ChatClient.wrap('apps tests') do
        RakeUtils.system_stream_output 'DEV=1 npm run test'
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
    args = [
      "--verbose",
      "--pegasus=localhost.code.org:3000",
      "--dashboard=localhost-studio.code.org:3000",
      "--local",
      "--headed",
    ]

    if ENV.fetch('feature', nil)
      # Perform one or more specific test files (delimited by commas)
      features = ENV.fetch('feature', nil).split(',')
      feature_path = features.map do |feature|
        File.expand_path(feature)
      end.join(',')
      args << "--feature=#{feature_path}"
    else
      # Perform all tests
      args << "--with-status-page"
    end

    # If 'browser=' specified, we pass along our desired browser (firefox, chrome, etc)
    if ENV.fetch('browser', nil)
      args << "--browser=#{ENV.fetch('browser', nil)}"
    end

    # If 'selenium=' is specified, we point the UI tests to the given selenium URL
    if ENV.fetch('selenium', nil)
      url = ENV.fetch('selenium', nil) == "" ? "http://localhost:4444/wd/hub" : ENV.fetch('selenium', nil)
      args << "--selenium-hub-url=#{url}"
    end

    Dir.chdir(dashboard_dir('test/ui/')) do
      RakeUtils.system "./runner.rb #{args.join(' ')}"
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

  def self.run_dashboard_legacy_tests
    Dir.chdir(dashboard_legacy_dir) do
      ChatClient.wrap('dashboard legacy tests') do
        RakeUtils.rake_stream_output 'test'
      end
    end
  end

  def self.run_pegasus_tests
    Dir.chdir(pegasus_dir) do
      ChatClient.wrap('pegasus tests') do
        # Make sure the pegasus database is created before running pegasus
        # tests. This might be pegasus_test (on development machines) or
        # pegasus_unittest (during ci on the test machine).
        #
        # This does not enforce that all migrations have been applied.
        # Strangely, during our CI process, this is taken care of by the
        # prepare_dbs step in shared/rake/test.rake which works because shared
        # tests run before pegasus tests.
        with_rack_env(:test) do
          RakeUtils.rake_stream_output 'db:ensure_created'
        end
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

  def self.run_bin_tests
    Dir.chdir(bin_dir) do
      ChatClient.wrap('bin tests') do
        RakeUtils.rake_stream_output 'test'
      end
    end
  end
end
