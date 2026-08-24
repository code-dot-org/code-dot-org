require 'test_helper'

class QuizQuestionTest < ActiveSupport::TestCase
  test "creates a plain QuizQuestion row via STI" do
    question = create(:quiz_question)
    assert_equal 'QuizQuestion', QuizQuestion.find(question.id).type
  end

  test "requires question_key, question_name, and question" do
    question = build(:quiz_question, question_key: nil, question_name: nil, question: nil)
    refute question.valid?
    assert_includes question.errors.attribute_names, :question_key
    assert_includes question.errors.attribute_names, :question_name
    assert_includes question.errors.attribute_names, :question
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

  test "parent_id chains a question to the prior revision" do
    original = create(:quiz_question)
    revision = create(:quiz_question, parent: original)

    assert_equal original, revision.parent
  end

  test "not used_in_published_unit? when attached to no quiz at all" do
    question = create(:quiz_question)
    refute question.used_in_published_unit?
  end

  test "not used_in_published_unit? when the quiz's unit is still in_development" do
    question = create(:quiz_question)
    quiz = create(:quiz)
    script = create(:script, :in_single_unit_course)
    create(:script_level, script: script, levels: [quiz])
    create(:quiz_level_question, level: quiz, quiz_question: question)

    refute question.used_in_published_unit?
  end

  test "used_in_published_unit? when the quiz's unit is stable" do
    question = create(:quiz_question)
    quiz = create(:quiz)
    script = create(:script)
    create(:single_unit_course, unit: script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    create(:script_level, script: script, levels: [quiz])
    create(:quiz_level_question, level: quiz, quiz_question: question)

    assert question.used_in_published_unit?
  end

  test "used_in_published_unit? when the quiz's unit is sunsetting" do
    question = create(:quiz_question)
    quiz = create(:quiz)
    script = create(:script)
    create(:single_unit_course, unit: script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.sunsetting)
    create(:script_level, script: script, levels: [quiz])
    create(:quiz_level_question, level: quiz, quiz_question: question)

    assert question.used_in_published_unit?
  end
end
