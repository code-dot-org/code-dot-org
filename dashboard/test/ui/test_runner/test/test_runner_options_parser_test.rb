require 'minitest/autorun'
require_relative '../test_runner_options_parser'
class TestRunnerOptionsParserTest < Minitest::Test
  BROWSERS_JSON_CONTENT = [
    {
      name: "Chrome",
      browserName: "chrome",
      browserVersion: "105",
      platformName: "Windows 10",
      'sauce:options': {
        screenResolution: "1280x1024",
        extendedDebugging: true
      }
    },
    {
      name: "Safari",
      browserName: "Safari",
      browserVersion: "14",
      platformName: "macOS 11.00"
    },
    {
      name: "Firefox",
      browserName: "firefox",
      browserVersion: "112",
      platformName: "Windows 10"
    },
    {
      name: "iPhone",
      platformName: "iOS",
      platformVersion: "15.4",
      browserName: "safari",
      'appium:deviceName': "iPhone Simulator",
      mobile: true,
      'sauce:options': {
        deviceOrientation: "LANDSCAPE"
      }
    },
    {
      name: "iPad",
      platformName: "iOS",
      platformVersion: "14.5",
      browserName: "safari",
      'appium:deviceName': "iPad Simulator",
      mobile: true,
      'sauce:options': {
        deviceOrientation: "LANDSCAPE"
      }
    }
  ].to_json

  def test_all_browser_configs
    argv = %w[-c Chrome,Safari,Firefox,iPhone,iPad]

    parser = TestRunnerOptionsParser.new(argv)
    parser.parse
    expected_config = JSON.parse(BROWSERS_JSON_CONTENT)
    assert_equal expected_config, parser.select_browser_configs
  end

  def test_browser_os_version_and_browser_version_combinations
    argv = %w[-b chrome -o Windows -v 86.0]
    parser = TestRunnerOptionsParser.new(argv)
    options = parser.parse

    assert_equal 'chrome', options.browser
    assert_equal 'Windows', options.os_version
    assert_equal '86.0', options.browser_version
  end

  def test_local_and_local_headless_interaction
    argv = %w[-l --headed]
    parser = TestRunnerOptionsParser.new(argv)
    options = parser.parse

    assert_equal 'true', options.local
    refute options.local_headless
  end

  def test_feature_flag_behavior
    argv = ['-f', 'feature1,feature2, feature3,feature 4, feature 5 , feature6']
    parser = TestRunnerOptionsParser.new(argv)
    options = parser.parse

    assert_equal ['feature1', 'feature2', ' feature3', 'feature 4', ' feature 5 ', ' feature6'], options.features
  end

  def test_maximize_and_auto_retry_flags
    argv = %w[-m -a]
    parser = TestRunnerOptionsParser.new(argv)
    options = parser.parse

    assert options.maximize
    assert options.auto_retry
  end

  def test_domain_overrides
    argv = %w[-p custom.code.org -d custom-studio.code.org]
    parser = TestRunnerOptionsParser.new(argv)
    options = parser.parse

    assert_equal 'custom.code.org', options.pegasus_domain
    assert_equal 'custom-studio.code.org', options.dashboard_domain
  end

  def test_absence_of_mandatory_option
    argv = []
    parser = TestRunnerOptionsParser.new(argv)

    options = parser.parse
    assert_nil options.browser
  end
end
