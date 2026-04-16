require 'test_helper'

class StudentWorkHelperTest < ActionView::TestCase
  include StudentWorkHelper

  setup do
    @student = create(:student)
    @script = create(:script, :in_single_unit_course)
    lesson_group = create(:lesson_group, script: @script)
    @lesson = create(:lesson, :with_activity_section, lesson_group: lesson_group, script: @script)
  end

  # ---------------------------------------------------------------------------
  # Helpers
  # ---------------------------------------------------------------------------

  def make_assessment_script_level(level)
    create(
      :script_level,
      :assessment,
      levels: [level],
      lesson: @lesson,
      script: @script,
      activity_section: @lesson.activity_sections.first
    )
  end

  def passing_result
    ActivityConstants::MINIMUM_PASS_RESULT
  end

  def failing_result
    ActivityConstants::MINIMUM_PASS_RESULT - 1
  end

  # ---------------------------------------------------------------------------
  # Empty / basic shape
  # ---------------------------------------------------------------------------

  test "returns empty array when lesson has no assessment script levels" do
    create(:script_level, levels: [create(:level)], lesson: @lesson, script: @script,
      activity_section: @lesson.activity_sections.first
)

    result = lesson_assessment_analysis(@lesson.id, @student.id)

    assert_equal [], result
  end

  test "returns one entry per assessment level with all expected keys" do
    multi = create(:multi)
    make_assessment_script_level(multi)

    result = lesson_assessment_analysis(@lesson.id, @student.id)

    assert_equal 1, result.length
    entry = result.first
    assert_includes entry, :level_id
    assert_includes entry, :script_level_id
    assert_includes entry, :attempts
    assert_includes entry, :correct
    assert_includes entry, :question_text
    assert_includes entry, :student_response
  end

  test "non-assessment script levels are excluded" do
    create(:script_level, levels: [create(:multi)], lesson: @lesson, script: @script,
      activity_section: @lesson.activity_sections.first
)
    assessment_multi = create(:multi)
    make_assessment_script_level(assessment_multi)

    result = lesson_assessment_analysis(@lesson.id, @student.id)

    assert_equal 1, result.length
    assert_equal assessment_multi.id, result.first[:level_id]
  end

  test "multiple assessment script levels all appear in order" do
    multi1 = create(:multi)
    multi2 = create(:multi)
    sl1 = make_assessment_script_level(multi1)
    sl2 = make_assessment_script_level(multi2)

    result = lesson_assessment_analysis(@lesson.id, @student.id)

    assert_equal 2, result.length
    assert_equal sl1.id, result[0][:script_level_id]
    assert_equal sl2.id, result[1][:script_level_id]
  end

  # ---------------------------------------------------------------------------
  # Attempt counting
  # ---------------------------------------------------------------------------

  test "student with no user_level has attempts 0 and correct false" do
    make_assessment_script_level(create(:multi))

    entry = lesson_assessment_analysis(@lesson.id, @student.id).first

    assert_equal 0, entry[:attempts]
    assert_equal false, entry[:correct]
  end

  test "student attempted but did not pass" do
    multi = create(:multi)
    make_assessment_script_level(multi)
    create(:user_level, user: @student, level: multi, script: @script,
      attempts: 3, best_result: failing_result
)

    entry = lesson_assessment_analysis(@lesson.id, @student.id).first

    assert_equal 3, entry[:attempts]
    assert_equal false, entry[:correct]
  end

  test "student passed has correct true" do
    multi = create(:multi)
    make_assessment_script_level(multi)
    create(:user_level, user: @student, level: multi, script: @script,
      attempts: 1, best_result: passing_result
)

    entry = lesson_assessment_analysis(@lesson.id, @student.id).first

    assert_equal 1, entry[:attempts]
    assert_equal true, entry[:correct]
  end

  # ---------------------------------------------------------------------------
  # Multi level — question text and student response
  # ---------------------------------------------------------------------------

  test "multi level question_text comes from questions[0][text]" do
    multi = create(:multi)
    make_assessment_script_level(multi)

    entry = lesson_assessment_analysis(@lesson.id, @student.id).first

    assert_equal 'question text', entry[:question_text]
  end

  test "multi level student_response reflects selected answer hash" do
    multi = create(:multi)
    make_assessment_script_level(multi)
    level_source = create(:level_source, level: multi, data: '0')
    create(:user_level, user: @student, level: multi, script: @script,
      attempts: 1, best_result: passing_result, level_source: level_source
)

    entry = lesson_assessment_analysis(@lesson.id, @student.id).first

    assert_equal({'text' => 'answer1', 'correct' => true}, entry[:student_response])
  end

  # ---------------------------------------------------------------------------
  # FreeResponse — question text
  # ---------------------------------------------------------------------------

  test "free_response question_text comes from long_instructions" do
    fr = create(:free_response)
    fr.update!(properties: fr.properties.merge('long_instructions' => 'Why does this work?'))
    make_assessment_script_level(fr)
    OpenaiEvaluateHelper.stubs(:evaluate_free_response)

    entry = lesson_assessment_analysis(@lesson.id, @student.id).first

    assert_equal 'Why does this work?', entry[:question_text]
  end

  # ---------------------------------------------------------------------------
  # FreeResponse — evaluation path
  # ---------------------------------------------------------------------------

  test "existing all_complete_correct evaluation: correct true, evaluate_free_response not called" do
    fr = create(:free_response)
    make_assessment_script_level(fr)
    create(:user_level_evaluation,
      student_id: @student.id,
      level_id: fr.id,
      unit_id: @script.id,
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT],
      reasoning: 'Good work'
)
    OpenaiEvaluateHelper.expects(:evaluate_free_response).never

    entry = lesson_assessment_analysis(@lesson.id, @student.id).first

    assert_equal true, entry[:correct]
    assert_equal SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT], entry[:evaluation]
    assert_equal 'Good work', entry[:aiReasoning]
  end

  test "existing evaluation with non-passing status: correct false" do
    fr = create(:free_response)
    make_assessment_script_level(fr)
    create(:user_level_evaluation,
      student_id: @student.id,
      level_id: fr.id,
      unit_id: @script.id,
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT]
)
    OpenaiEvaluateHelper.stubs(:evaluate_free_response)

    entry = lesson_assessment_analysis(@lesson.id, @student.id).first

    assert_equal false, entry[:correct]
  end

  test "no evaluation and student has submission: evaluate_free_response called once and result used" do
    fr = create(:free_response)
    make_assessment_script_level(fr)
    level_source = create(:level_source, level: fr, data: 'my answer')
    create(:user_level, user: @student, level: fr, script: @script,
      attempts: 1, best_result: failing_result, level_source: level_source
)

    OpenaiEvaluateHelper.expects(:evaluate_free_response).with(instance_of(UserLevel), instance_of(Unit)).once
    # Stub find_by to simulate evaluate_free_response having created the evaluation.
    mock_eval = stub(
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT],
      reasoning: 'Good job'
    )
    UserLevelEvaluation.stubs(:find_by).returns(mock_eval)

    entry = lesson_assessment_analysis(@lesson.id, @student.id).first

    assert_equal true, entry[:correct]
    assert_equal SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT], entry[:evaluation]
  end

  test "no evaluation and no submission: evaluate_free_response not called, correct false" do
    fr = create(:free_response)
    make_assessment_script_level(fr)
    OpenaiEvaluateHelper.expects(:evaluate_free_response).never

    entry = lesson_assessment_analysis(@lesson.id, @student.id).first

    assert_equal false, entry[:correct]
    assert_nil entry[:evaluation]
  end

  # ---------------------------------------------------------------------------
  # Unknown level type — question_text is nil
  # ---------------------------------------------------------------------------

  test "level type without question_text support returns nil question_text" do
    level = create(:level)
    make_assessment_script_level(level)

    entry = lesson_assessment_analysis(@lesson.id, @student.id).first

    assert_nil entry[:question_text]
  end

  # ---------------------------------------------------------------------------
  # LevelGroup expansion
  # ---------------------------------------------------------------------------

  test "level_group with sublevels produces one entry per sublevel" do
    lg = create(:level_group)
    sub1 = create(:multi)
    sub2 = create(:multi)
    sub3 = create(:free_response)
    lg.update_levels_and_texts_by_page([[sub1, sub2], [sub3]])
    sl = make_assessment_script_level(lg)
    OpenaiEvaluateHelper.stubs(:evaluate_free_response)

    result = lesson_assessment_analysis(@lesson.id, @student.id)

    assert_equal 3, result.length
    assert_equal([sub1.id, sub2.id, sub3.id], result.pluck(:level_id))
    result.each {|e| assert_equal sl.id, e[:script_level_id]}
  end

  test "level_group sublevel user_levels are keyed to sublevel ids" do
    lg = create(:level_group)
    sub = create(:multi)
    lg.update_levels_and_texts_by_page([[sub]])
    make_assessment_script_level(lg)
    create(:user_level, user: @student, level: sub, script: @script,
      attempts: 2, best_result: passing_result
)

    result = lesson_assessment_analysis(@lesson.id, @student.id)

    assert_equal 1, result.length
    assert_equal 2, result.first[:attempts]
    assert_equal true, result.first[:correct]
  end

  test "level_group free_response sublevels trigger evaluation logic" do
    lg = create(:level_group)
    fr = create(:free_response)
    lg.update_levels_and_texts_by_page([[fr]])
    make_assessment_script_level(lg)
    level_source = create(:level_source, level: fr, data: 'sublevel answer')
    create(:user_level, user: @student, level: fr, script: @script,
      attempts: 1, best_result: failing_result, level_source: level_source
)

    OpenaiEvaluateHelper.expects(:evaluate_free_response).with(instance_of(UserLevel), instance_of(Unit)).once
    mock_eval = stub(
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT],
      reasoning: nil
    )
    UserLevelEvaluation.stubs(:find_by).returns(mock_eval)

    entry = lesson_assessment_analysis(@lesson.id, @student.id).first

    assert_equal true, entry[:correct]
  end
end
