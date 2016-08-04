require_relative './rake_utils'
require_relative '../../deployment'
require 'cdo/hip_chat'

def with_hipchat_logging(name)
  start_time = Time.now
  HipChat.log "Running #{name}..."
  yield if block_given?
  HipChat.log "#{name} succeeded in #{RakeUtils.format_duration(Time.now - start_time)}"
rescue => e
  # notify developers room and our own room
  "<b>#{name}</b> failed in #{RakeUtils.format_duration(Time.now - start_time)}".tap do |message|
    HipChat.log message, color: 'red', notify: 1
    HipChat.developers message, color: 'red', notify: 1
  end
  # log detailed error information in our own room
  puts "#{e}\n#{CDO.backtrace e}", message_format: 'text'
  raise
end

module TestRunUtils
  def self.run_apps_tests
    Dir.chdir(apps_dir) do
      with_hipchat_logging('apps tests') do
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

  def self.run_code_studio_tests
    Dir.chdir(code_studio_dir) do
      with_hipchat_logging('code studio tests') do
        RakeUtils.system 'npm run test'
      end
    end
  end

  def self.run_blockly_core_tests
    Dir.chdir(blockly_core_dir) do
      with_hipchat_logging('blockly core tests') do
        RakeUtils.system './test.sh'
      end
    end
  end

  def self.run_dashboard_tests
    Dir.chdir(dashboard_dir) do
      with_hipchat_logging('dashboard tests') do
        RakeUtils.rake_stream_output 'test'
        RakeUtils.rake_stream_output 'konacha:run'
      end
    end
  end

  def self.run_pegasus_tests
    Dir.chdir(pegasus_dir) do
      with_hipchat_logging('pegasus tests') do
        RakeUtils.rake_stream_output 'test'
      end
    end
  end

  def self.run_shared_tests
    Dir.chdir(shared_dir) do
      with_hipchat_logging('shared tests') do
        RakeUtils.rake_stream_output 'test'
      end
    end
  end
end
