require_relative '../../../shared/test/test_helper'
require_relative '../../cdo/pegasus'
require_relative '../../cdo/web_purify'
require 'minitest/autorun'

class WebPurifyTest < Minitest::Test
  include SetupTest

  def setup
    CDO.stubs(webpurify_key: 'mocksecret')
  end

  # Do additional VCR configuration so as to prevent the CDO.webpurify_key from being logged to the
  # YML cassette, instead replacing it with a placeholder string.
  VCR.configure do |c|
    c.filter_sensitive_data('<API_KEY>') {CDO.webpurify_key}
  end

  def test_find_potential_profanities
    assert_nil WebPurify.find_potential_profanities('not a swear')
    assert_equal ['sh1t', 'shit'], WebPurify.find_potential_profanities('sh1t! holy shit')
    assert_equal ['shitstain'], WebPurify.find_potential_profanities('shitstain')
    assert_nil WebPurify.find_potential_profanities('assuage')
    assert_nil WebPurify.find_potential_profanities('8005555555 t')
    assert_equal ['ass'], WebPurify.find_potential_profanities('ass')
  end

  def test_find_potential_profanities_with_language
    assert_nil WebPurify.find_potential_profanities('scheiße', ['en'])
    assert_equal ['scheiße'], WebPurify.find_potential_profanities('scheiße', ['de'])
    assert_equal ['puta'], WebPurify.find_potential_profanities('puta madre', ['es'])
  end
end
