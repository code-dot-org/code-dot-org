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

  def make_script_level(level)
    create(
      :script_level,
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

  def make_user_level(level, best_result:, attempts: 1, level_source: nil)
    create(
      :user_level,
      user: @student,
      level: level,
      script: @script,
      attempts: attempts,
      best_result: best_result,
      level_source: level_source
    )
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

  test "returns unattempted entries when student_id is nil (signed-out user)" do
    multi = create(:multi)
    make_assessment_script_level(multi)

    result = lesson_assessment_analysis(@lesson.id, nil)

    assert_equal 1, result.length
    entry = result.first
    assert_equal 0, entry[:attempts]
    assert_equal false, entry[:correct]
    assert_equal "No attempt yet", entry[:student_response]
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

  # lesson_progress_status

  # ---------------------------------------------------------------------------
  # Zero levels / no attempts
  # ---------------------------------------------------------------------------

  test "progress: no levels returns all zeros" do
    assert_equal(
      {
        levels_total_count: 0, levels_attempted_count: 0,
        validated_levels_total_count: 0, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: levels present but no user_levels returns completed and correct as 0" do
    make_script_level(create(:multi))
    make_script_level(create(:multi))

    assert_equal(
      {
        levels_total_count: 2, levels_attempted_count: 0,
        validated_levels_total_count: 2, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  # ---------------------------------------------------------------------------
  # Multi
  # ---------------------------------------------------------------------------

  test "progress: all multi attempted and passing" do
    m1 = create(:multi)
    m2 = create(:multi)
    make_script_level(m1)
    make_script_level(m2)
    make_user_level(m1, best_result: passing_result)
    make_user_level(m2, best_result: passing_result)

    assert_equal(
      {
        levels_total_count: 2, levels_attempted_count: 2,
        validated_levels_total_count: 2, validated_levels_correct_count: 2,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: all multi attempted, none passing" do
    m1 = create(:multi)
    m2 = create(:multi)
    make_script_level(m1)
    make_script_level(m2)
    make_user_level(m1, best_result: failing_result)
    make_user_level(m2, best_result: failing_result)

    assert_equal(
      {
        levels_total_count: 2, levels_attempted_count: 2,
        validated_levels_total_count: 2, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 2
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: all multi attempted, mix of passing and failing" do
    m1 = create(:multi)
    m2 = create(:multi)
    make_script_level(m1)
    make_script_level(m2)
    make_user_level(m1, best_result: passing_result)
    make_user_level(m2, best_result: failing_result)

    assert_equal(
      {
        levels_total_count: 2, levels_attempted_count: 2,
        validated_levels_total_count: 2, validated_levels_correct_count: 1,
        validated_levels_incorrect_count: 1
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: one of two multi attempted and passing" do
    m1 = create(:multi)
    m2 = create(:multi)
    make_script_level(m1)
    make_script_level(m2)
    make_user_level(m1, best_result: passing_result)

    assert_equal(
      {
        levels_total_count: 2, levels_attempted_count: 1,
        validated_levels_total_count: 2, validated_levels_correct_count: 1,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: two of three multi attempted with mix of results" do
    m1 = create(:multi)
    m2 = create(:multi)
    m3 = create(:multi)
    make_script_level(m1)
    make_script_level(m2)
    make_script_level(m3)
    make_user_level(m1, best_result: passing_result)
    make_user_level(m2, best_result: failing_result)

    assert_equal(
      {
        levels_total_count: 3, levels_attempted_count: 2,
        validated_levels_total_count: 3, validated_levels_correct_count: 1,
        validated_levels_incorrect_count: 1
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: one of two multi attempted but failing" do
    m1 = create(:multi)
    m2 = create(:multi)
    make_script_level(m1)
    make_script_level(m2)
    make_user_level(m1, best_result: failing_result)

    assert_equal(
      {
        levels_total_count: 2, levels_attempted_count: 1,
        validated_levels_total_count: 2, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 1
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  # ---------------------------------------------------------------------------
  # External level — not validated (correct = attempted by definition)
  # ---------------------------------------------------------------------------

  test "progress: external level clicked counts as completed but not validated" do
    ext = create(:external)
    make_script_level(ext)
    make_user_level(ext, best_result: ActivityConstants::BEST_PASS_RESULT)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 1,
        validated_levels_total_count: 0, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: external level not clicked counts as not completed" do
    ext = create(:external)
    make_script_level(ext)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 0,
        validated_levels_total_count: 0, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  # ---------------------------------------------------------------------------
  # BubbleChoice
  # ---------------------------------------------------------------------------

  test "progress: bubble_choice with no sublevels attempted" do
    bc = create(:bubble_choice_level)
    sub = create(:level)
    bc.setup_sublevels([sub.name])
    make_script_level(bc)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 0,
        validated_levels_total_count: 1, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: bubble_choice with one sublevel attempted and passing" do
    bc = create(:bubble_choice_level)
    sub = create(:level)
    bc.setup_sublevels([sub.name])
    make_script_level(bc)
    make_user_level(sub, best_result: passing_result)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 1,
        validated_levels_total_count: 1, validated_levels_correct_count: 1,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: bubble_choice with one sublevel attempted but failing" do
    bc = create(:bubble_choice_level)
    sub = create(:level)
    bc.setup_sublevels([sub.name])
    make_script_level(bc)
    make_user_level(sub, best_result: failing_result)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 1,
        validated_levels_total_count: 1, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 1
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: bubble_choice with two sublevels attempted, one passing" do
    bc = create(:bubble_choice_level)
    sub1 = create(:level)
    sub2 = create(:level)
    bc.setup_sublevels([sub1.name, sub2.name])
    make_script_level(bc)
    make_user_level(sub1, best_result: failing_result)
    make_user_level(sub2, best_result: passing_result)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 1,
        validated_levels_total_count: 1, validated_levels_correct_count: 1,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: bubble_choice with all aichat sublevels is not validated" do
    bc = create(:bubble_choice_level)
    aichat1 = create(:aichat)
    aichat2 = create(:aichat)
    bc.setup_sublevels([aichat1.name, aichat2.name])
    make_script_level(bc)
    make_user_level(aichat1, best_result: passing_result)
    create(:aichat_event, user: @student, level_id: aichat1.id, script_id: @script.id)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 1,
        validated_levels_total_count: 0, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  # ---------------------------------------------------------------------------
  # LevelGroup
  # ---------------------------------------------------------------------------

  test "progress: level_group with no sublevels attempted" do
    lg = create(:level_group)
    sub = create(:multi)
    lg.update_levels_and_texts_by_page([[sub]])
    make_script_level(lg)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 0,
        validated_levels_total_count: 1, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: level_group with one multi sublevel passing" do
    lg = create(:level_group)
    sub = create(:multi)
    lg.update_levels_and_texts_by_page([[sub]])
    make_script_level(lg)
    make_user_level(sub, best_result: passing_result)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 1,
        validated_levels_total_count: 1, validated_levels_correct_count: 1,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: level_group with two sublevels attempted, one failing" do
    lg = create(:level_group)
    sub1 = create(:multi)
    sub2 = create(:multi)
    lg.update_levels_and_texts_by_page([[sub1, sub2]])
    make_script_level(lg)
    make_user_level(sub1, best_result: passing_result)
    make_user_level(sub2, best_result: failing_result)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 1,
        validated_levels_total_count: 1, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 1
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: level_group unattempted sublevel does not count as incorrect" do
    lg = create(:level_group)
    sub1 = create(:multi)
    sub2 = create(:multi)
    lg.update_levels_and_texts_by_page([[sub1, sub2]])
    make_script_level(lg)
    make_user_level(sub1, best_result: passing_result)
    # sub2 not attempted

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 1,
        validated_levels_total_count: 1, validated_levels_correct_count: 1,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: level_group free_response sublevel with ALL_COMPLETE_CORRECT eval" do
    lg = create(:level_group)
    fr = create(:free_response)
    lg.update_levels_and_texts_by_page([[fr]])
    make_script_level(lg)
    ls = create(:level_source, level: fr, data: 'my answer')
    make_user_level(fr, best_result: failing_result, level_source: ls)
    create(:user_level_evaluation,
      student_id: @student.id,
      level_id: fr.id,
      unit_id: @script.id,
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT]
    )
    OpenaiEvaluateHelper.expects(:evaluate_free_response).never

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 1,
        validated_levels_total_count: 1, validated_levels_correct_count: 1,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: level_group free_response sublevel no evaluation and no submission" do
    lg = create(:level_group)
    fr = create(:free_response)
    lg.update_levels_and_texts_by_page([[fr]])
    make_script_level(lg)
    make_user_level(fr, best_result: failing_result)
    OpenaiEvaluateHelper.expects(:evaluate_free_response).never

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 1,
        validated_levels_total_count: 1, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 1
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  # ---------------------------------------------------------------------------
  # Aichat — not validated (correct = attempted by definition)
  # ---------------------------------------------------------------------------

  test "progress: aichat with no events is not complete" do
    make_script_level(create(:aichat))

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 0,
        validated_levels_total_count: 0, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: aichat with event but no user_level is not attempted" do
    aichat = create(:aichat)
    make_script_level(aichat)
    create(:aichat_event, user: @student, level_id: aichat.id, script_id: @script.id)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 0,
        validated_levels_total_count: 0, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: aichat with user_level but no event is not attempted" do
    aichat = create(:aichat)
    make_script_level(aichat)
    make_user_level(aichat, best_result: 100)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 0,
        validated_levels_total_count: 0, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: aichat with user_level and event is attempted but not validated" do
    aichat = create(:aichat)
    make_script_level(aichat)
    make_user_level(aichat, best_result: 100)
    create(:aichat_event, user: @student, level_id: aichat.id, script_id: @script.id)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 1,
        validated_levels_total_count: 0, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: aichat event for a different script does not count" do
    aichat = create(:aichat)
    make_script_level(aichat)
    other_script = create(:script, :in_single_unit_course)
    create(:aichat_event, user: @student, level_id: aichat.id, script_id: other_script.id)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 0,
        validated_levels_total_count: 0, validated_levels_correct_count: 0,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  test "progress: level_group free_response sublevel no evaluation but has submission triggers eval" do
    lg = create(:level_group)
    fr = create(:free_response)
    lg.update_levels_and_texts_by_page([[fr]])
    make_script_level(lg)
    ls = create(:level_source, level: fr, data: 'my answer')
    make_user_level(fr, best_result: failing_result, level_source: ls)

    OpenaiEvaluateHelper.expects(:evaluate_free_response).with(instance_of(UserLevel), instance_of(Unit)).once
    mock_eval = stub(
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT]
    )
    UserLevelEvaluation.stubs(:find_by).returns(mock_eval)

    assert_equal(
      {
        levels_total_count: 1, levels_attempted_count: 1,
        validated_levels_total_count: 1, validated_levels_correct_count: 1,
        validated_levels_incorrect_count: 0
      },
      lesson_progress_status(@lesson.id, @student.id)
    )
  end

  # ---------------------------------------------------------------------------
  # lesson_time_spent
  # ---------------------------------------------------------------------------

  test "time_spent: no user_levels returns 0" do
    make_script_level(create(:multi))

    assert_equal 0, lesson_time_spent(@lesson.id, @student.id)
  end

  test "time_spent: single level with time_spent returns that value" do
    level = create(:multi)
    make_script_level(level)
    create(:user_level, user: @student, level: level, script: @script,
      attempts: 1, best_result: passing_result, time_spent: 90
    )

    assert_equal 90, lesson_time_spent(@lesson.id, @student.id)
  end

  test "time_spent: sums time_spent across multiple levels" do
    m1 = create(:multi)
    m2 = create(:multi)
    make_script_level(m1)
    make_script_level(m2)
    create(:user_level, user: @student, level: m1, script: @script,
      attempts: 1, best_result: passing_result, time_spent: 60
    )
    create(:user_level, user: @student, level: m2, script: @script,
      attempts: 1, best_result: passing_result, time_spent: 45
    )

    assert_equal 105, lesson_time_spent(@lesson.id, @student.id)
  end

  test "time_spent: nil time_spent on a user_level is treated as 0" do
    m1 = create(:multi)
    m2 = create(:multi)
    make_script_level(m1)
    make_script_level(m2)
    create(:user_level, user: @student, level: m1, script: @script,
      attempts: 1, best_result: passing_result, time_spent: 30
    )
    create(:user_level, user: @student, level: m2, script: @script,
      attempts: 1, best_result: passing_result, time_spent: nil
    )

    assert_equal 30, lesson_time_spent(@lesson.id, @student.id)
  end

  test "time_spent: excludes user_levels from a different lesson in the same script" do
    other_lesson_group = create(:lesson_group, script: @script)
    other_lesson = create(:lesson, :with_activity_section,
      lesson_group: other_lesson_group, script: @script
    )
    level_this = create(:multi)
    level_other = create(:multi)
    create(:script_level, levels: [level_this], lesson: @lesson, script: @script,
      activity_section: @lesson.activity_sections.first
    )
    create(:script_level, levels: [level_other], lesson: other_lesson, script: @script,
      activity_section: other_lesson.activity_sections.first
    )
    create(:user_level, user: @student, level: level_this, script: @script,
      attempts: 1, best_result: passing_result, time_spent: 50
    )
    create(:user_level, user: @student, level: level_other, script: @script,
      attempts: 1, best_result: passing_result, time_spent: 200
    )

    assert_equal 50, lesson_time_spent(@lesson.id, @student.id)
  end

  test "time_spent: excludes user_levels from a different student" do
    other_student = create(:student)
    level = create(:multi)
    make_script_level(level)
    create(:user_level, user: @student, level: level, script: @script,
      attempts: 1, best_result: passing_result, time_spent: 40
    )
    create(:user_level, user: other_student, level: level, script: @script,
      attempts: 1, best_result: passing_result, time_spent: 999
    )

    assert_equal 40, lesson_time_spent(@lesson.id, @student.id)
  end

  test "time_spent: excludes user_levels from a different script" do
    other_script = create(:script, :in_single_unit_course)
    other_lg = create(:lesson_group, script: other_script)
    create(:lesson, :with_activity_section,
      lesson_group: other_lg, script: other_script
    )
    level = create(:multi)
    make_script_level(level)
    create(:user_level, user: @student, level: level, script: @script,
      attempts: 1, best_result: passing_result, time_spent: 70
    )
    create(:user_level, user: @student, level: level, script: other_script,
      attempts: 1, best_result: passing_result, time_spent: 999
    )

    assert_equal 70, lesson_time_spent(@lesson.id, @student.id)
  end

  test "time_spent: all nil time_spent returns 0" do
    level = create(:multi)
    make_script_level(level)
    create(:user_level, user: @student, level: level, script: @script,
      attempts: 1, best_result: passing_result, time_spent: nil
    )

    assert_equal 0, lesson_time_spent(@lesson.id, @student.id)
  end
end
