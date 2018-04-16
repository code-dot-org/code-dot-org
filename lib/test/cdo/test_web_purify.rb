require_relative '../../../shared/test/test_helper'
require_relative '../../cdo/pegasus'
require_relative '../../cdo/web_purify'
require 'minitest/autorun'

class WebPurifyTest < Minitest::Test
  include SetupTest

  CDO.webpurify_key = 'mocksecret'

  # Do additional VCR configuration so as to prevent the CDO.webpurify_key from being logged to the
  # YML cassette, instead replacing it with a placeholder string.
  VCR.configure do |c|
    c.filter_sensitive_data('<API_KEY>') {CDO.webpurify_key}
  end

  def test_find_potential_profanity
    skip "Disabling while working on unexpected VCR failures"
    assert_nil WebPurify.find_potential_profanity('not a swear')
    assert_equal 'shit', WebPurify.find_potential_profanity('holy shit')
    assert_equal 'shitstain', WebPurify.find_potential_profanity('shitstain')
    assert_nil WebPurify.find_potential_profanity('assuage')
    assert_nil WebPurify.find_potential_profanity('8005555555 t')
    assert_equal 'ass', WebPurify.find_potential_profanity('ass')
  end

  def test_find_potential_profanity_with_language
    skip "Disabling while working on unexpected VCR failures"
    assert_nil WebPurify.find_potential_profanity('scheiße', ['en'])
    assert_equal 'scheiße', WebPurify.find_potential_profanity('scheiße', ['de'])
    assert_equal 'puta', WebPurify.find_potential_profanity('puta madre', ['es'])
  end
end
