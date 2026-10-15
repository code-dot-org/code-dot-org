require 'test_helper'

class QuizQuestionPlacementTest < ActiveSupport::TestCase
  test "orders by page then position" do
    quiz = create(:quiz)
    third = create(:quiz_question_placement, level: quiz, page: 2, position: 1)
    first = create(:quiz_question_placement, level: quiz, page: 1, position: 1)
    second = create(:quiz_question_placement, level: quiz, page: 1, position: 2)

    assert_equal [first, second, third], QuizQuestionPlacement.where(level: quiz).to_a
  end

  test "a quiz_question cannot be included twice in the same level" do
    quiz = create(:quiz)
    question = create(:quiz_question)
    create(:quiz_question_placement, level: quiz, quiz_question: question)

    assert_raises(ActiveRecord::RecordNotUnique) do
      QuizQuestionPlacement.create!(level: quiz, quiz_question: question, page: 1, position: 2)
    end
  end

  test "serializable_hash substitutes question_key for internal columns" do
    placement = create(:quiz_question_placement, page: 1, position: 1)

    assert_equal(
      {'question_key' => placement.quiz_question.key, 'page' => 1, 'position' => 1},
      placement.serializable_hash
    )
  end

  test "creating a placement writes the quiz's .level file with the new placement" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    CDO.stubs(:properties_encryption_key).returns(SecureRandom.base64(Encryption::KEY_LENGTH / 8))
    FileUtils.stubs(:mkdir_p)
    File.stubs(:write)
    quiz = create(:quiz, published: true)
    question = create(:quiz_question)

    File.expects(:write).with do |_path, contents|
      parsed = JSON.parse(Nokogiri::XML(contents).at('config').text)
      parsed['placements'] == [{'question_key' => question.key, 'page' => 1, 'position' => 1}]
    end

    create(:quiz_question_placement, level: quiz, quiz_question: question, page: 1, position: 1)
  end

  test "destroying a placement writes the quiz's .level file with the placement removed" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    CDO.stubs(:properties_encryption_key).returns(SecureRandom.base64(Encryption::KEY_LENGTH / 8))
    FileUtils.stubs(:mkdir_p)
    File.stubs(:write)
    quiz = create(:quiz, published: true)
    placement = create(:quiz_question_placement, level: quiz)

    File.expects(:write).with do |_path, contents|
      JSON.parse(Nokogiri::XML(contents).at('config').text)['placements'] == []
    end

    placement.destroy!
  end
end
