require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'
require_relative '../src/env'
require_relative '../../lib/cdo/web_purify'

class WebPurifyTest < Minitest::Unit::TestCase
  def test_profanity_checking
    return unless CDO.webpurify_key
    assert_nil(WebPurify.find_potential_profanity('not a swear'))
    assert_equal('shit', WebPurify.find_potential_profanity('holy shit'))
    assert_equal('shitstain', WebPurify.find_potential_profanity('shitstain'))
    assert_nil(WebPurify.find_potential_profanity('assuage'))
    assert_equal('ass', WebPurify.find_potential_profanity('ass'))
    assert_nil(WebPurify.find_potential_profanity('scheiße', ['en']))
    assert_equal('scheiße', WebPurify.find_potential_profanity('scheiße', ['de']))
    assert_nil(WebPurify.find_potential_profanity('8005555555 t'))
  end
end
