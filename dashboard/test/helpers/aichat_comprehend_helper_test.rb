require 'test_helper'

class AichatComprehendHelperTest < ActionView::TestCase
  include AichatComprehendHelper

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
    puts "total byte size: #{(emoji_string + special_chars_string).bytesize}"
    text_segment_lists = AichatComprehendHelper.get_text_segment_lists(emoji_string + special_chars_string)
    assert_equal 4, text_segment_lists.size
    assert_equal 10, text_segment_lists[0].size
    assert_equal 10, text_segment_lists[1].size
    assert_equal 10, text_segment_lists[2].size
    assert_equal 8, text_segment_lists[3].size
    text_segment_lists.flatten.each {|segment| assert segment.bytesize <= 1000}
  end
end
