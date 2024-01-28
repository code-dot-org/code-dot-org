require 'minitest/autorun'
require_relative '../test_runner_options_parser'

class TestRunnerOptionsParserTest < Minitest::Test
  def test_browser_os_version_and_browser_version_combinations
    argv = ['-b', 'chrome', '-o', 'Windows', '-v', '86.0']
    options = TestRunner::OptionsParser.parse_options(argv)

    assert_equal 'chrome', options.browser
    assert_equal 'Windows', options.os_version
    assert_equal '86.0', options.browser_version
  end

  def test_local_and_local_headless_interaction
    argv = ['-l', '--headed']
    options = TestRunner::OptionsParser.parse_options(argv)

    assert_equal 'true', options.local
    refute options.local_headless
  end

  def test_feature_flag_behavior
    argv = ['-f', 'feature1,feature2, feature3,feature 4, feature 5 , feature6']
    options = TestRunner::OptionsParser.parse_options(argv)

    assert_equal ['feature1', 'feature2', ' feature3', 'feature 4', ' feature 5 ', ' feature6'], options.features
  end

  def test_maximize_and_auto_retry_flags
    argv = ['-m', '-a']
    options = TestRunner::OptionsParser.parse_options(argv)

    assert options.maximize
    assert options.auto_retry
  end

  def test_domain_overrides
    argv = ['-p', 'custom.code.org', '-d', 'custom-studio.code.org']
    options = TestRunner::OptionsParser.parse_options(argv)

    assert_equal 'custom.code.org', options.pegasus_domain
    assert_equal 'custom-studio.code.org', options.dashboard_domain
  end

  def test_absence_of_mandatory_option
    argv = []
    options = TestRunner::OptionsParser.parse_options(argv)

    assert_nil options.browser
  end
end
