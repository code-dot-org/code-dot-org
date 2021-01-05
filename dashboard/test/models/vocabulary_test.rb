require 'test_helper'

class VocabularyTest < ActiveSupport::TestCase
  test "can create vocabulary" do
    vocab = create :vocabulary, key: 'foo', word: 'foo', definition: 'a fake word'
    assert_equal 'foo', vocab.key
    assert_equal 'foo', vocab.word
    assert_equal 'a fake word', vocab.definition
  end
end
