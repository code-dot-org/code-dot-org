require 'test_helper'

class AichatComprehendHelperTest < ActionView::TestCase
  include AichatComprehendHelper

  setup do
    @client = StubbedComprehendClient.new
    AichatComprehendHelper.stubs(:create_comprehend_client).returns(@client)
  end

  test 'returns text, toxicity, and max category' do
    toxicity = 0.4
    category_name = 'PROFANITY'
    category_score = 0.2
    text = "hi"
    comprehend_response = StubbedComprehendResponse.new(
      [
        StubbedComprehendResult.new(
          toxicity,
          [StubbedComprehendLabel.new(category_name, category_score)]
        )
      ]
    )
    @client.stubs(:detect_toxic_content).returns(comprehend_response)

    response = AichatComprehendHelper.get_toxicity(text, 'en')

    assert_equal text, response[:text]
    assert_equal toxicity, response[:toxicity]
    assert_equal category_name, response[:max_category].name
    assert_equal category_score, response[:max_category].score
  end

  test 'returns max toxicity and max category if there are multiple response' do
    comprehend_response_1 = StubbedComprehendResponse.new(
      [
        StubbedComprehendResult.new(
          0.2,
          [StubbedComprehendLabel.new('INSULT', 0.3), StubbedComprehendLabel.new('PROFANITY', 0.4)]
        ),
        StubbedComprehendResult.new(
          0.3,
          [StubbedComprehendLabel.new('INSULT', 0.3), StubbedComprehendLabel.new('GRAPHIC', 0.4)]
        )
      ]
    )

    comprehend_response_2 = StubbedComprehendResponse.new(
      [
        # Expected max
        StubbedComprehendResult.new(
          0.7,
          [StubbedComprehendLabel.new('HATE_SPEECH', 0.9), StubbedComprehendLabel.new('INSULT', 0.4)]
        ),
        StubbedComprehendResult.new(
          0.1,
          [StubbedComprehendLabel.new('INSULT', 0.5), StubbedComprehendLabel.new('HARASSMENT_OR_ABUSE', 0.2)]
        )
      ]
    )

    @client.stubs(:detect_toxic_content).returns(comprehend_response_1, comprehend_response_2)
    # Stub text segmentation to return two lists so we make two comprehend calls
    AichatComprehendHelper.stubs(:get_text_segment_lists).returns([["hi"], ["hello"]])

    response = AichatComprehendHelper.get_toxicity('hi hello', 'en')
    assert_equal 0.7, response[:toxicity]
    assert_equal 'HATE_SPEECH', response[:max_category].name
    assert_equal 0.9, response[:max_category].score
  end

  test 'returns nil if text is nil, empty, or blank' do
    assert_nil AichatComprehendHelper.get_toxicity(nil, 'en')
    assert_nil AichatComprehendHelper.get_toxicity("", 'en')
    assert_nil AichatComprehendHelper.get_toxicity("         ", 'en')
  end

  test 'correctly chunks long text inputs' do
    # 5 characters * 3000 = 15000 bytes.
    long_message = "abcd " * 3000
    # Comprehend's segment limit is 1000 bytes, and lists are limited to 10 segments.
    # Expect to convert this to two lists with 10 and 5 segments respectively
    text_segment_lists = AichatComprehendHelper.get_text_segment_lists(long_message)
    assert_equal 2, text_segment_lists.size
    assert_equal 10, text_segment_lists[0].size
    assert_equal 5, text_segment_lists[1].size
    text_segment_lists.flatten.each {|segment| assert segment.bytesize <= 1000}
  end

  test "text with single words above segment limit are split up" do
    small_word = "hello"
    # 5 characters (no space) * 500 = 2500 bytes.
    long_word = "abcde" * 500
    # Expect the long word to be split into 2 1000-byte chunks and 1 500-byte chunk
    # Expect to convert this to one list with 4 segments (small_word + 3 segments of large_word)
    text_segment_lists = AichatComprehendHelper.get_text_segment_lists("#{small_word} #{long_word}")
    assert_equal 1, text_segment_lists.size
    assert_equal 4, text_segment_lists[0].size
    text_segment_lists.flatten.each {|segment| assert segment.bytesize <= 1000}
  end

  test "emojis and special characters are handled correctly" do
    # 4 bytes per emoji * 4 emojis = 16 * 1000 = 16000
    # No spaces so we can test splitting up a UTF-8 string by bytes
    emoji_string = "😊🚀🔥🪩" * 1000
    # These are all 2-byte UTF-8 characters. 2 bytes * 10 characters + 1 space = 21 * 1000 = 21000
    special_chars_string = "դϬƵӋ֚»˙ыۨΚ " * 1000
    # Total expected bytes: 16000 + 21000 = 37000
    # Expect 4 lists with 10, 10, 10, and 8 respectively (due to how the characters are chunked, we end up with an extra segment)
    text_segment_lists = AichatComprehendHelper.get_text_segment_lists(emoji_string + special_chars_string)
    assert_equal 4, text_segment_lists.size
    assert_equal 10, text_segment_lists[0].size
    assert_equal 10, text_segment_lists[1].size
    assert_equal 10, text_segment_lists[2].size
    assert_equal 8, text_segment_lists[3].size
    text_segment_lists.flatten.each {|segment| assert segment.bytesize <= 1000}
  end
end
