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

    assert_equal text, response[:flagged_segment]
    assert_equal toxicity, response[:toxicity]
    assert_equal category_name, response[:max_category][:name]
    assert_equal category_score, response[:max_category][:score]
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
    AichatComprehendHelper.stubs(:get_text_segments).returns(%w[hi hello toxic hey])

    # Stub max segments per list size so we make two comprehend calls
    AichatComprehendHelper.stub_const(:MAX_SEGMENTS_PER_LIST, 2) do
      response = AichatComprehendHelper.get_toxicity('hi hello toxic hey', 'en')
      assert_equal 'toxic', response[:flagged_segment]
      assert_equal 0.7, response[:toxicity]
      assert_equal 'HATE_SPEECH', response[:max_category][:name]
      assert_equal 0.9, response[:max_category][:score]
    end
  end

  test 'returns nil if text is nil, empty, or blank' do
    assert_nil AichatComprehendHelper.get_toxicity(nil, 'en')
    assert_nil AichatComprehendHelper.get_toxicity("", 'en')
    assert_nil AichatComprehendHelper.get_toxicity("         ", 'en')
  end

  test 'correctly chunks long text inputs' do
    # 5 characters * 3000 = 15000 bytes.
    long_message = "abcd " * 3000
    # Comprehend's segment limit is 1000 bytes.
    # Expect to convert this to 15 segments.
    segments = AichatComprehendHelper.get_text_segments(long_message)
    assert_equal 15, segments.size
    segments.each {|segment| assert segment.bytesize <= 1000}
  end

  test "text with single words above segment limit are split up" do
    small_word = "hello"
    # 5 characters (no space) * 500 = 2500 bytes.
    long_word = "abcde" * 500
    # Expect the long word to be split into 2 1000-byte chunks and 1 500-byte chunk
    # Expect 4 segments (small_word + 3 segments of large_word)
    segments = AichatComprehendHelper.get_text_segments("#{small_word} #{long_word}")
    assert_equal 4, segments.size
    segments.each {|segment| assert segment.bytesize <= 1000}
  end

  test "emojis and special characters are handled correctly" do
    # 4 bytes per emoji * 4 emojis = 16 * 1000 = 16000
    # No spaces so we can test splitting up a UTF-8 string by bytes
    emoji_string = "😊🚀🔥🪩" * 1000
    # These are all 2-byte UTF-8 characters. 2 bytes * 10 characters + 1 space = 21 * 1000 = 21000
    special_chars_string = "դϬƵӋ֚»˙ыۨΚ " * 1000
    # Total expected bytes: 16000 + 21000 = 37000
    # Expect 38 segments (due to how the characters are chunked, we end up with an extra segment)
    segments = AichatComprehendHelper.get_text_segments(emoji_string + special_chars_string)
    assert_equal 38, segments.size
    segments.each {|segment| assert segment.bytesize <= 1000}
  end
end
