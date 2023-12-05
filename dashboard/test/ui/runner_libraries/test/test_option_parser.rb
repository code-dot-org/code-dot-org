require_relative '../option_parser' # Replace with the actual path to your OptionsParser file

class OptionsParserTest < ActiveSupport::TestCase
  def test_if_config_and_local_config_are_enabled
    ARGV.replace(['-c', 'config1'])
    options_parser = OptionsParser.new
    assert_equal ['config1'], options_parser.options.config
    assert_nil options_parser.options.local
  end

  def test_parse_options_parsing
    options_parser = OptionsParser.new
    ARGV.replace(%w[-b chrome -o 7 -v 31 -f features/sharepage.feature])
    options_parser.parse_options
    assert_equal 'chrome', options_parser.options.browser
    assert_equal '7', options_parser.options.os_version
    assert_equal '31', options_parser.options.browser_version
    assert_equal ['features/sharepage.feature'], options_parser.options.features
    assert_nil options_parser.options.local
  end

  def test_if_non_local_domains_work
    options_parser = OptionsParser.new
    assert_equal 'test.code.org', options_parser.options.pegasus_domain
    assert_equal 'test-studio.code.org', options_parser.options.dashboard_domain
    assert_equal 'test.hourofcode.com', options_parser.options.hourofcode_domain
    assert_equal 'test.csedweek.org', options_parser.options.csedweek_domain
    assert_equal 'test-advocacy.code.org', options_parser.options.advocacy_domain
  end
end
