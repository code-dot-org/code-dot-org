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

  test "cannot edit definition of common sense media vocabulary" do
    vocab = create :vocabulary, key: 'foo', word: 'foo', definition: 'a fake word', common_sense_media: true
    assert_raises ActiveRecord::RecordInvalid do
      vocab.definition = 'updated definition'
      vocab.save!
    end
  end

  test 'vocabulary sanitizes word when turning it into key' do
    vocab = create :vocabulary,
      word: 'Some !! ßtring 123 ,with, "ILLEGAL" _characters_.'
    assert_equal vocab.key, "Some  tring  with ILLEGAL characters"
  end

  test 'vocabulary prevents invalid keys' do
    vocab = create :vocabulary
    assert vocab.valid?
    vocab.key = "!!invalid key!!"
    refute vocab.valid?
    vocab.key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz- /"
    assert vocab.valid?
  end
end
