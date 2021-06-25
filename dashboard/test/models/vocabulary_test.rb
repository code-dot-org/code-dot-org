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
      word: 'Some !! ßtring 123 ,with, "ILLEGAL" _characters_.',
      key: nil
    assert_equal vocab.key, "some_tring_with_illegal_characters_"
  end

  test 'key sanitization' do
    assert_equal "case_normalized", Vocabulary.sanitize_key("CaSe NoRmAlIzEd")
    assert_equal "_special_characters_normalized_", Vocabulary.sanitize_key(":special/characters-normalized!")
    assert_equal "whitespace_stripped", Vocabulary.sanitize_key("  whitespace stripped  \t  ")
    assert_equal "consecutive_underscores_compacted", Vocabulary.sanitize_key("Consecutive    underscores:\t\n- compacted")
  end

  test 'vocabulary does not automatically uniquify keys' do
    course_version = create :course_version
    create :vocabulary, word: "Word", key: nil, course_version: course_version
    assert_raises ActiveRecord::RecordNotUnique do
      create :vocabulary, word: "Word", key: nil, course_version: course_version
    end
  end

  test 'key uniqueness' do
    vocab = create :vocabulary, key: "unique"

    # basic uniqueness
    assert_equal "unique_a",  Vocabulary.uniquify_key(vocab.key, vocab.course_version.id)

    # uniqueness is per-course version
    assert_equal "unique",  Vocabulary.uniquify_key(vocab.key, nil)

    # we might increment more than once
    create :vocabulary, key: "unique_a", course_version: vocab.course_version
    assert_equal "unique_b",  Vocabulary.uniquify_key(vocab.key, vocab.course_version.id)

    # we might increment a LOT more than once
    ('b'..'z').each do |character|
      create :vocabulary, key: "unique_#{character}", course_version: vocab.course_version
    end
    assert_equal "unique_aa",  Vocabulary.uniquify_key(vocab.key, vocab.course_version.id)
  end

  test 'vocabulary prevents invalid keys' do
    vocab = create :vocabulary
    assert vocab.valid?
    vocab.key = "!!invalid key!!"
    refute vocab.valid?
    vocab.key = "abcdefghijklmnopqrstuvwxyz_"
    assert vocab.valid?
  end

  test 'serialize scripts that vocabulary is in' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create :levelbuilder

    course_version = create :course_version, :with_unit_group
    unit_group = course_version.content_root
    script1 = create :script
    script2 = create :script
    script1.expects(:write_script_json).once
    script2.expects(:write_script_json).once
    create :unit_group_unit, unit_group: unit_group, script: script1, position: 1
    create :unit_group_unit, unit_group: unit_group, script: script2, position: 2
    lesson1 = create :lesson, script: script1
    lesson2 = create :lesson, script: script2
    vocabulary = create :vocabulary, course_version: course_version
    vocabulary.lessons = [lesson1, lesson2]
    vocabulary.serialize_scripts
  end

  test "summarize retrives translations" do
    course_offering = create :course_offering
    course_version = create :course_version, course_offering: course_offering
    vocabulary = create(
      :vocabulary,
      word: "English word",
      definition: "English definition",
      course_version: course_version
    )
    assert_equal(
      "#{vocabulary.key}/#{course_offering.key}/#{course_version.key}",
      Services::GloballyUniqueIdentifiers.build_vocab_key(vocabulary)
    )
    test_locale = :"te-ST"
    custom_i18n = {
      "data" => {
        "vocabularies" => {
          "#{vocabulary.key}/#{course_offering.key}/#{course_version.key}" => {
            "word" => "Translated word",
            "definition" => "Translated definition",
          }
        }
      }
    }
    I18n.backend.store_translations(test_locale, custom_i18n)
    assert_equal("English word", vocabulary.summarize_for_lesson_show[:word])
    assert_equal("English definition", vocabulary.summarize_for_lesson_show[:definition])
    I18n.locale = test_locale
    assert_equal("Translated word", vocabulary.summarize_for_lesson_show[:word])
    assert_equal("Translated definition", vocabulary.summarize_for_lesson_show[:definition])
    I18n.locale = I18n.default_locale
  end
end
