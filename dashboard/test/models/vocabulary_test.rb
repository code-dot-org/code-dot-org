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

  test 'vocabulary automatically sanitizes word when turning it into key' do
    vocab = create :vocabulary,
      word: 'Some !! ßtring 123 ,with, "ILLEGAL" _characters_.'
    assert_equal vocab.key, "some_tring_with_illegal_characters_"
  end

  test 'key sanitization' do
    assert_equal "case_normalized", Vocabulary.sanitize_key("CaSe NoRmAlIzEd")
    assert_equal "_special_characters_normalized_", Vocabulary.sanitize_key(":special/characters-normalized!")
    assert_equal "whitespace_stripped", Vocabulary.sanitize_key("  whitespace stripped  \t  ")
    assert_equal "consecutive_underscores_compacted", Vocabulary.sanitize_key("Consecutive    underscores:\t\n- compacted")
  end

  test 'vocabulary prevents invalid keys' do
    vocab = create :vocabulary
    assert vocab.valid?
    vocab.key = "!!invalid key!!"
    refute vocab.valid?
    vocab.key = "abcdefghijklmnopqrstuvwxyz_"
    assert vocab.valid?
  end
end
