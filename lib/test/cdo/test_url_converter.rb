require_relative '../test_helper'
require 'cdo/url_converter'

class UrlConverterTest < Minitest::Test
  def production_url_converter
    UrlConverter.new
  end

  def test_no_ops_in_production_configuration
    url_converter = production_url_converter
    assert_equal 'https://code.org', url_converter.replace_origin('https://code.org')
    assert_equal 'https://code.org/', url_converter.replace_origin('https://code.org/')
    assert_equal 'https://code.org/curriculum/unplugged', url_converter.replace_origin('https://code.org/curriculum/unplugged')
    assert_equal 'https://studio.code.org', url_converter.replace_origin('https://studio.code.org')
    assert_equal 'https://hourofcode.com', url_converter.replace_origin('https://hourofcode.com')
    assert_equal 'https://csedweek.org', url_converter.replace_origin('https://csedweek.org')
    assert_equal 'https://csedweek.org/about', url_converter.replace_origin('https://csedweek.org/about')
  end

  def test_upgrades_protocol_in_production_configuration
    url_converter = production_url_converter
    assert_equal 'https://code.org', url_converter.replace_origin('http://code.org')
    assert_equal 'https://code.org/', url_converter.replace_origin('http://code.org/')
    assert_equal 'https://code.org/curriculum/unplugged', url_converter.replace_origin('http://code.org/curriculum/unplugged')
    assert_equal 'https://studio.code.org', url_converter.replace_origin('http://studio.code.org')
    assert_equal 'https://hourofcode.com', url_converter.replace_origin('http://hourofcode.com')
    assert_equal 'https://csedweek.org', url_converter.replace_origin('http://csedweek.org')
    assert_equal 'https://csedweek.org/about', url_converter.replace_origin('http://csedweek.org/about')
  end

  def test_dont_raise_on_learn_code_org_in_production_configuration
    url_converter = production_url_converter
    assert_equal 'https://learn.code.org', url_converter.replace_origin('https://learn.code.org')
  end

  def tst_url_converter
    UrlConverter.new(
      pegasus_host: 'test.code.org',
      dashboard_host: 'test-studio.code.org',
      hourofcode_host: 'test.hourofcode.com',
      csedweek_host: 'test.csedweek.org'
    )
  end

  def test_conversions_in_test_configuration
    url_converter = tst_url_converter
    assert_equal 'https://test.code.org', url_converter.replace_origin('https://code.org')
    assert_equal 'https://test.code.org/', url_converter.replace_origin('https://code.org/')
    assert_equal 'https://test.code.org/curriculum/unplugged', url_converter.replace_origin('https://code.org/curriculum/unplugged')
    assert_equal 'https://test-studio.code.org', url_converter.replace_origin('https://studio.code.org')
    assert_equal 'https://test.hourofcode.com', url_converter.replace_origin('https://hourofcode.com')
    assert_equal 'https://test.csedweek.org', url_converter.replace_origin('https://csedweek.org')
    assert_equal 'https://test.csedweek.org/about', url_converter.replace_origin('https://csedweek.org/about')
  end

  def test_upgrades_protocol_in_test_configuration
    url_converter = tst_url_converter
    assert_equal 'https://test.code.org', url_converter.replace_origin('http://code.org')
    assert_equal 'https://test-studio.code.org', url_converter.replace_origin('http://studio.code.org')
  end

  def test_raises_on_learn_code_org_in_test_configuration
    url_converter = tst_url_converter
    assert_raises do
      url_converter.replace_origin('https://learn.code.org')
    end
  end

  def local_url_converter
    UrlConverter.new(
      pegasus_host: 'localhost.code.org:3000',
      dashboard_host: 'localhost-studio.code.org:3000',
      hourofcode_host: 'localhost.hourofcode.com:3000',
      csedweek_host: 'localhost.csedweek.org:3000'
    )
  end

  def test_conversions_in_local_configuration
    url_converter = local_url_converter
    assert_equal 'https://localhost.code.org:3000', url_converter.replace_origin('https://code.org')
    assert_equal 'https://localhost.code.org:3000/', url_converter.replace_origin('https://code.org/')
    assert_equal 'https://localhost.code.org:3000/curriculum/unplugged', url_converter.replace_origin('https://code.org/curriculum/unplugged')
    assert_equal 'https://localhost-studio.code.org:3000', url_converter.replace_origin('https://studio.code.org')
    assert_equal 'https://localhost.hourofcode.com:3000', url_converter.replace_origin('https://hourofcode.com')
    assert_equal 'https://localhost.csedweek.org:3000', url_converter.replace_origin('https://csedweek.org')
    assert_equal 'https://localhost.csedweek.org:3000/about', url_converter.replace_origin('https://csedweek.org/about')
  end

  def test_does_not_upgrade_protocol_in_local_configuration
    url_converter = local_url_converter
    assert_equal 'http://localhost.code.org:3000', url_converter.replace_origin('http://code.org')
    assert_equal 'http://localhost-studio.code.org:3000', url_converter.replace_origin('http://studio.code.org')
  end

  def test_raises_on_learn_code_org_in_local_configuration
    url_converter = local_url_converter
    assert_raises do
      url_converter.replace_origin('https://learn.code.org')
    end
  end
end
