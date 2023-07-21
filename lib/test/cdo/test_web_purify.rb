require 'minitest/autorun'
require_relative '../../../shared/test/test_helper'
require_relative '../../cdo/pegasus'
require_relative '../../cdo/web_purify'

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

  def test_chunk_text_for_webpurify
    assert_equal [], WebPurify.split_text("")

    text = "This text is smaller than the maximum chunk length."
    assert_equal [text], WebPurify.split_text(text)

    text = "Let's make this text a little bit longer than the maximum chunk length"
    expected_chunks = ["Let's make", "this text a", "little bit", "longer than", "the maximum", "chunk length"]
    assert_equal expected_chunks, WebPurify.split_text(text, 12)

    text = "{  func(arg)    lets add    \n    some unnecessary whitespace to this text; }"
    expected_chunks = ["{  func(arg)", "lets add    ", "some", "unnecessary", "whitespace", "to this", "text; }"]
    assert_equal expected_chunks, WebPurify.split_text(text, 12)

    text = ("a" * 29_900) + " and here is an extra extra extra long string of text that should get chunked into a separate request to webpurify"
    expected_chunks = [("a" * 29_900) + " and here is an extra extra extra long string of text that should get chunked into a separate", "request to webpurify"]
    assert_equal expected_chunks, WebPurify.split_text(text)

    assert_equal ['aaa'], WebPurify.split_text('aaa', 3)
    assert_equal ['aaaa', 'b', 'ccc'], WebPurify.split_text('aaaa b ccc', 3)
  end

  def test_find_potential_profanities
    assert_nil WebPurify.find_potential_profanities(nil)
    assert_nil WebPurify.find_potential_profanities('')

    assert_nil WebPurify.find_potential_profanities('not a swear')
    assert_nil WebPurify.find_potential_profanities('assuage')
    assert_nil WebPurify.find_potential_profanities('8005555555 t')

    assert_equal ['sh1t', 'shit'], WebPurify.find_potential_profanities('sh1t! holy shit')
    assert_equal ['shitstain'], WebPurify.find_potential_profanities('shitstain')
    assert_equal ['ass'], WebPurify.find_potential_profanities('ass')
  end

  def test_find_potential_profanities_with_language
    assert_nil WebPurify.find_potential_profanities('scheiße', ['es'])

    assert_equal ['scheiße'], WebPurify.find_potential_profanities('scheiße', ['de'])
    assert_equal ['puta'], WebPurify.find_potential_profanities('puta madre', ['es'])

    assert_equal ['mierda', 'scheiße'], WebPurify.find_potential_profanities('some mierda and some scheiße', ['es', 'de'])
  end

  def test_find_potential_profanities_with_special_characters
    assert_nil WebPurify.find_potential_profanities('8005555555 t <*>%')
    assert_equal ['sh1t', 'shit'], WebPurify.find_potential_profanities('<*>% sh1t! holy shit')
  end

  def test_find_potential_profanities_with_long_text
    text = ("aaaa " * 5999) + "shit dcCc d and this has some profanity damn too"
    assert_equal ['shit', 'damn'], WebPurify.find_potential_profanities(text)
  end

  def test_find_potential_profanities_with_text_exceeding_maximum_length
    err = assert_raises WebPurify::TextTooLongError do
      WebPurify.find_potential_profanities(("a " * 60_000) + "a")
    end
    assert_equal 120001, err.text_length
  end

  # Recording for this test was captured with an invalid API key
  def test_find_potential_profanities_with_invalid_api_key
    err = assert_raises StandardError do
      WebPurify.find_potential_profanities("peformed this recording with mocked api key")
    end
    assert_match "Profanity check failed with code 100: Invalid API Key", err.message
  end

  # Recording for this test was captured using special characters and an invalid API key
  def test_find_potential_profanities_with_false_body
    err = assert_raises StandardError do
      WebPurify.find_potential_profanities("< mocked API key and special characters triggers a response of {\"rsp\": false} error > %")
    end
    assert_match "Profanity check failed", err.message
  end
end
