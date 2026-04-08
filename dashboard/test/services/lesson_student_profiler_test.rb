require 'test_helper'

class LessonStudentProfilerTest < ActiveSupport::TestCase
  # Shared lesson setup: 2 Aichat levels + 2 FreeResponse levels + 1 Panels level.
  # Panels is excluded from the profile.
  setup do
    @unit    = create(:script)
    @lesson  = create(:lesson, script: @unit)
    @student = create(:student)

    @aichat1    = create(:aichat)
    @aichat2    = create(:aichat)
    @free_resp1 = create(:free_response)
    @free_resp2 = create(:free_response)
    @panels     = create(:panels)

    create(:script_level, script: @unit, lesson: @lesson, levels: [@aichat1])
    create(:script_level, script: @unit, lesson: @lesson, levels: [@aichat2])
    create(:script_level, script: @unit, lesson: @lesson, levels: [@free_resp1])
    create(:script_level, script: @unit, lesson: @lesson, levels: [@free_resp2])
    create(:script_level, script: @unit, lesson: @lesson, levels: [@panels])
  end

  # --- helpers ---

  def complete_aichat(level)
    create(:user_level, user: @student, level: level, script: @unit)
    create(:aichat_event, user: @student, level_id: level.id, script_id: @unit.id)
  end

  def complete_free_response(level, text: 'My answer')
    level_source = create(:level_source, data: text)
    create(:user_level, user: @student, level: level, script: @unit, level_source: level_source)
  end

  def correct_eval(level)
    UserLevelEvaluation.create!(
      student_id: @student.id,
      level_id: level.id,
      unit_id: @unit.id,
      evaluator: 'AI',
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT],
      evaluation_criteria: 'test criteria',
      reasoning: 'test reasoning'
    )
  end

  def incorrect_eval(level)
    UserLevelEvaluation.create!(
      student_id: @student.id,
      level_id: level.id,
      unit_id: @unit.id,
      evaluator: 'AI',
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT],
      evaluation_criteria: 'test criteria',
      reasoning: 'test reasoning'
    )
  end

  def profile
    LessonStudentProfiler.new(@lesson, @student).call
  end

  # --- 7 profile tests ---

  test "All Complete + All Correct" do
    complete_aichat(@aichat1)
    complete_aichat(@aichat2)
    complete_free_response(@free_resp1)
    complete_free_response(@free_resp2)
    correct_eval(@free_resp1)
    correct_eval(@free_resp2)

    result = profile
    assert_equal 'all', result[:completion]
    assert_equal 'all', result[:correctness]
  end

  test "All Complete + Some Correct" do
    complete_aichat(@aichat1)
    complete_aichat(@aichat2)
    complete_free_response(@free_resp1)
    complete_free_response(@free_resp2)
    correct_eval(@free_resp1)
    incorrect_eval(@free_resp2)

    result = profile
    assert_equal 'all', result[:completion]
    assert_equal 'some', result[:correctness]
  end

  test "All Complete + None Correct" do
    complete_aichat(@aichat1)
    complete_aichat(@aichat2)
    complete_free_response(@free_resp1)
    complete_free_response(@free_resp2)
    incorrect_eval(@free_resp1)
    incorrect_eval(@free_resp2)

    result = profile
    assert_equal 'all', result[:completion]
    assert_equal 'none', result[:correctness]
  end

  test "Some Complete + All Correct" do
    complete_aichat(@aichat1)
    # aichat2: not complete
    complete_free_response(@free_resp1)
    complete_free_response(@free_resp2)
    correct_eval(@free_resp1)
    correct_eval(@free_resp2)

    result = profile
    assert_equal 'some', result[:completion]
    assert_equal 'all', result[:correctness]
  end

  test "Some Complete + Some Correct" do
    complete_aichat(@aichat1)
    # aichat2: not complete
    complete_free_response(@free_resp1)
    complete_free_response(@free_resp2)
    correct_eval(@free_resp1)
    incorrect_eval(@free_resp2)

    result = profile
    assert_equal 'some', result[:completion]
    assert_equal 'some', result[:correctness]
  end

  test "Some Complete + None Correct" do
    complete_aichat(@aichat1)
    # aichat2: not complete
    complete_free_response(@free_resp1)
    complete_free_response(@free_resp2)
    incorrect_eval(@free_resp1)
    incorrect_eval(@free_resp2)

    result = profile
    assert_equal 'some', result[:completion]
    assert_equal 'none', result[:correctness]
  end

  test "None Complete" do
    # No completions at all
    result = profile
    assert_equal 'none', result[:completion]
    assert_equal 'na', result[:correctness]
  end

  # --- edge cases ---

  test "Panels are excluded from completable levels" do
    panels_only_lesson = create(:lesson, script: @unit)
    create(:script_level, script: @unit, lesson: panels_only_lesson, levels: [@panels])

    result = LessonStudentProfiler.new(panels_only_lesson, @student).call
    assert_equal 'none', result[:completion]
    assert_equal 'na', result[:correctness]
  end

  test "Aichat with UserLevel but no AichatEvent is not complete" do
    # UserLevel exists but student never actually chatted
    create(:user_level, user: @student, level: @aichat1, script: @unit)
    # No AichatEvent

    result = profile
    assert_equal 'none', result[:completion]
  end

  test "FreeResponse with blank LevelSource is not complete" do
    blank_source = create(:level_source, data: '   ')
    create(:user_level, user: @student, level: @free_resp1, script: @unit, level_source: blank_source)

    result = profile
    assert_equal 'none', result[:completion]
  end

  test "FreeResponse with no existing eval creates one via OpenAI" do
    complete_free_response(@free_resp1)
    complete_free_response(@free_resp2)
    complete_aichat(@aichat1)
    complete_aichat(@aichat2)
    # No pre-existing UserLevelEvaluation records

    assert_difference 'StudentWorkEvaluation.count', 2 do
      profile
    end
  end

  test "FreeResponse with existing eval does not create another" do
    complete_free_response(@free_resp1)
    complete_free_response(@free_resp2)
    complete_aichat(@aichat1)
    complete_aichat(@aichat2)
    correct_eval(@free_resp1)
    correct_eval(@free_resp2)

    # Both evals already exist; profiler should not create new ones
    assert_no_difference 'StudentWorkEvaluation.count' do
      profile
    end
  end

  test "correctness is na when lesson has only Aichat levels" do
    aichat_only_lesson = create(:lesson, script: @unit)
    create(:script_level, script: @unit, lesson: aichat_only_lesson, levels: [@aichat1])
    complete_aichat(@aichat1)

    result = LessonStudentProfiler.new(aichat_only_lesson, @student).call
    assert_equal 'all', result[:completion]
    assert_equal 'na', result[:correctness]
  end
end
