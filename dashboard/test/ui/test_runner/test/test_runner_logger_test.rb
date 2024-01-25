require 'minitest/autorun'
require 'fileutils'
require_relative '../test_runner_logger'

class TestRunnerLoggerTest < Minitest::Test
  LOCAL_LOG_DIRECTORY = "test_logs"
  def setup
    @logger = TestRunnerLogger.new(LOCAL_LOG_DIRECTORY, true, true)
    @logger.open_log_files
  end

  def teardown
    @logger.close_log_files
    FileUtils.rm_rf(LOCAL_LOG_DIRECTORY)
  end

  def test_log_files_opened
    assert File.exist?(File.join(LOCAL_LOG_DIRECTORY, "success.log"))
    assert File.exist?(File.join(LOCAL_LOG_DIRECTORY, "error.log"))
    assert File.exist?(File.join(LOCAL_LOG_DIRECTORY, "errorbrowsers.log"))
  end

  def test_log_success
    @logger.log_success("Test success message")
    @logger.close_log_files
    assert_includes File.read(File.join(LOCAL_LOG_DIRECTORY, "success.log")), "Test success message"
  end

  def test_log_error
    @logger.log_error("Test error message")
    @logger.close_log_files
    assert_includes File.read(File.join(LOCAL_LOG_DIRECTORY, "error.log")), "Test error message"
  end

  def test_log_browser_error
    @logger.log_browser_error("Test browser error message")
    @logger.close_log_files
    assert_includes File.read(File.join(LOCAL_LOG_DIRECTORY, "errorbrowsers.log")), "Test browser error message"
  end
end
