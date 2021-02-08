require 'test_helper'

class VocabularyTest < ActiveSupport::TestCase
  test "can create vocabulary" do
    vocab = create :vocabulary, word: 'foo', definition: 'a fake word'
    assert_equal 'foo', vocab.word
    assert_equal 'a fake word', vocab.definition
  end

  test "vocabulary can be added to a lesson" do
    lesson = create :lesson
    vocab = create :vocabulary, key: 'foo', word: 'foo', definition: 'a fake word'
    # Associate vocab with lesson after save; otherwise, Lesson will complain
    # about missing vocabulary_id
    vocab.lessons = [lesson]

    assert_equal 1, vocab.lessons.length
    assert_equal 1, lesson.vocabularies.length
  end
end
