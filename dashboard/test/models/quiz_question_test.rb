require 'test_helper'

class QuizQuestionTest < ActiveSupport::TestCase
  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  setup do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)
  end

  test "creates a plain QuizQuestion row via STI" do
    question = create(:quiz_question)
    assert_equal 'QuizQuestion', QuizQuestion.find(question.id).type
  end

  test "requires key, name, and content" do
    question = build(:quiz_question, key: nil, name: nil, content: nil)
    refute question.valid?
    assert_includes question.errors.attribute_names, :key
    assert_includes question.errors.attribute_names, :name
    assert_includes question.errors.attribute_names, :content
  end

  test "a question need not be tagged with any Standard" do
    question = create(:quiz_question)
    assert_empty question.standards
  end

  test "can be tagged with a Standard via QuizQuestionStandard" do
    question = create(:quiz_question)
    standard = create(:standard)
    create(:quiz_question_standard, quiz_question: question, standard: standard)

    assert_equal [standard], question.reload.standards
  end

  test "fork_parent_id chains a question to the prior revision" do
    original = create(:quiz_question)
    revision = create(:quiz_question, fork_parent: original)

    assert_equal original, revision.fork_parent
  end

  test "deleting the parent leaves the fork's fork_parent_id as a dangling pointer" do
    original = create(:quiz_question)
    revision = create(:quiz_question, fork_parent: original)

    original.destroy!

    revision.reload
    assert_equal original.id, revision.fork_parent_id
    assert_nil revision.fork_parent
  end

  test "not used_in_published_unit? when attached to no quiz at all" do
    question = create(:quiz_question)
    refute question.used_in_published_unit?
  end

  test "not used_in_published_unit? when the quiz's unit is still in_development" do
    question = create(:quiz_question)
    quiz = create(:quiz)
    unit = create(:unit, :in_single_unit_course)
    create(:script_level, script: unit, levels: [quiz])
    create(:quiz_question_placement, level: quiz, quiz_question: question)

    refute question.used_in_published_unit?
  end

  test "used_in_published_unit? when the quiz's unit is stable" do
    question = create(:quiz_question)
    quiz = create(:quiz)
    unit = create(:unit)
    create(:single_unit_course, unit: unit, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    create(:script_level, script: unit, levels: [quiz])
    create(:quiz_question_placement, level: quiz, quiz_question: question)

    assert question.used_in_published_unit?
  end

  test "used_in_published_unit? when the quiz's unit is sunsetting" do
    question = create(:quiz_question)
    quiz = create(:quiz)
    unit = create(:unit)
    create(:single_unit_course, unit: unit, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.sunsetting)
    create(:script_level, script: unit, levels: [quiz])
    create(:quiz_question_placement, level: quiz, quiz_question: question)

    assert question.used_in_published_unit?
  end

  test "key must be unique" do
    create(:quiz_question, key: 'dupe-key')
    dupe = build(:quiz_question, key: 'dupe-key')

    refute dupe.valid?
    assert_includes dupe.errors.attribute_names, :key
  end

  test "formatted_for_file includes a plaintext name but never content or explanation" do
    question = create(:multiple_choice_question, explanation: 'because')

    file_contents = question.formatted_for_file

    assert_includes file_contents, question.name
    refute_includes file_contents, question.content['question_title']
    refute_includes file_contents, 'because'
  end

  test "formatted_for_file's encrypted_content decrypts back to content and explanation" do
    question = create(:multiple_choice_question, explanation: 'because')

    parsed = JSON.parse(question.formatted_for_file)
    decrypted = Encryption.decrypt_object(parsed['encrypted_content'])

    assert_equal question.content, decrypted['content']
    assert_equal question.explanation, decrypted['explanation']
  end

  test "write_to_file does nothing outside levelbuilder_mode" do
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    File.expects(:write).never

    create(:quiz_question)
  end

  test "after_commit writes to file on create when in levelbuilder_mode" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    FileUtils.stubs(:mkdir_p)
    File.expects(:write)

    create(:quiz_question)
  end

  test "write_to_file writes formatted_for_file to config/quiz_questions/<key>.json" do
    question = create(:quiz_question)

    Rails.application.config.stubs(:levelbuilder_mode).returns true
    FileUtils.stubs(:mkdir_p)
    File.expects(:write).with(Rails.root.join("config/quiz_questions/#{question.key}.json"), question.formatted_for_file)
    question.write_to_file
  end

  test "destroying a question deletes its file instead of rewriting it" do
    question = create(:quiz_question)

    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.expects(:write).never
    FileUtils.expects(:rm_f).with(Rails.root.join("config/quiz_questions/#{question.key}.json"))
    question.destroy!
  end

  test "destroying a question does nothing to the file outside levelbuilder_mode" do
    question = create(:quiz_question)

    Rails.application.config.stubs(:levelbuilder_mode).returns false
    FileUtils.expects(:rm_f).never
    question.destroy!
  end

  test "setup creates a question from a quiz_questions file" do
    Dir.mktmpdir do |dir|
      FileUtils.mkdir_p("#{dir}/config/quiz_questions")
      key = SecureRandom.uuid
      File.write(
        "#{dir}/config/quiz_questions/#{key}.json",
        JSON.generate(
          'key' => key,
          'type' => 'MultipleChoiceQuestion',
          'name' => 'seeded_question',
          'encrypted_content' => Encryption.encrypt_object(
            'content' => {'question_title' => 'Title', 'choices' => [{'id' => 'a', 'text' => 'A'}, {'id' => 'b', 'text' => 'B'}], 'correct_choice_id' => 'a'},
            'explanation' => 'an explanation'
          )
        )
      )

      QuizQuestion.setup(dir)

      question = MultipleChoiceQuestion.find_by!(key: key)
      assert_equal 'seeded_question', question.name
      assert_equal 'an explanation', question.explanation
      assert_equal 'Title', question.content['question_title']
    end
  end

  test "setup updates an existing question in place rather than duplicating it" do
    Dir.mktmpdir do |dir|
      FileUtils.mkdir_p("#{dir}/config/quiz_questions")
      key = SecureRandom.uuid
      file_path = "#{dir}/config/quiz_questions/#{key}.json"
      write_seed_file = lambda do |name|
        File.write(
          file_path,
          JSON.generate(
            'key' => key,
            'type' => 'MultipleChoiceQuestion',
            'name' => name,
            'encrypted_content' => Encryption.encrypt_object(
              'content' => {'question_title' => 'Title', 'choices' => [{'id' => 'a', 'text' => 'A'}, {'id' => 'b', 'text' => 'B'}], 'correct_choice_id' => 'a'},
              'explanation' => ''
            )
          )
        )
      end

      write_seed_file.call('original_name')
      QuizQuestion.setup(dir)
      write_seed_file.call('renamed')
      QuizQuestion.setup(dir)

      assert_equal 1, QuizQuestion.where(key: key).count
      assert_equal 'renamed', QuizQuestion.find_by!(key: key).name
    end
  end

  test "setup seeds placeholder content and warns when the encryption key is missing outside production" do
    CDO.stubs(:properties_encryption_key).returns(nil)

    Dir.mktmpdir do |dir|
      FileUtils.mkdir_p("#{dir}/config/quiz_questions")
      key = SecureRandom.uuid
      File.write(
        "#{dir}/config/quiz_questions/#{key}.json",
        JSON.generate('key' => key, 'type' => 'MultipleChoiceQuestion', 'name' => 'seeded_question', 'encrypted_content' => 'bogus')
      )

      assert_output(/WARNING.*seeded with placeholder content due to missing CDO.properties_encryption_key/) {QuizQuestion.setup(dir)}

      question = MultipleChoiceQuestion.find_by!(key: key)
      assert_equal question.placeholder_content, question.content
    end
  end

  test "setup raises when the encryption key is missing in production" do
    CDO.stubs(:properties_encryption_key).returns(nil)
    CDO.stubs(:rack_env).returns(:production)

    Dir.mktmpdir do |dir|
      FileUtils.mkdir_p("#{dir}/config/quiz_questions")
      key = SecureRandom.uuid
      File.write(
        "#{dir}/config/quiz_questions/#{key}.json",
        JSON.generate('key' => key, 'type' => 'MultipleChoiceQuestion', 'name' => 'seeded_question', 'encrypted_content' => 'bogus')
      )

      assert_raises(Encryption::KeyMissingError) {QuizQuestion.setup(dir)}
    end
  end
end
