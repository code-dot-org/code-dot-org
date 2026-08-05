require 'test_helper'

class StudentSnapshotPromptHelperTest < ActiveSupport::TestCase
  include AiSystemPrompts::StudentSnapshotPromptHelper

  setup do
    @student = create(:student)
    @teacher = create(:teacher)
    @section = create(:section, teacher: @teacher)
    @section.students << @student
    @unit = create(:unit)
    @lesson_group = create(:lesson_group, script: @unit)
    @lesson = create(:lesson, script: @unit, lesson_group: @lesson_group)
    @level = create(:level)
    create(:script_level, script: @unit, lesson: @lesson, levels: [@level])

    # get_code_level_info reaches out to a real S3 client for student source code;
    # stub it so these tests exercise prompt compilation, not AWS credential resolution.
    ApplicationController.helpers.stubs(:get_student_code).returns('{}')
  end

  # ---------------------------------------------------------------------------
  # compile_prompt
  # ---------------------------------------------------------------------------

  test 'compile_prompt substitutes all variables' do
    template = "Lesson Name: {{lesson_name}}\nUnit Name: {{unit_name}}\nLevels: {{levels_info}}"
    variables = {lesson_name: 'Loops', unit_name: 'CSD Unit 1', levels_info: 'level 1 info'}

    result = AiSystemPrompts::StudentSnapshotPromptHelper.compile_prompt(template, variables)

    assert_equal "Lesson Name: Loops\nUnit Name: CSD Unit 1\nLevels: level 1 info", result
  end

  test 'compile_prompt leaves unmatched text untouched' do
    template = "Lesson Name: {{lesson_name}}\nSomething else entirely"
    variables = {lesson_name: 'Loops'}

    result = AiSystemPrompts::StudentSnapshotPromptHelper.compile_prompt(template, variables)

    assert_equal "Lesson Name: Loops\nSomething else entirely", result
  end

  test 'compile_prompt substitutes nil values as an empty string' do
    template = "Unit Overview: {{unit_overview}}"
    variables = {unit_overview: nil}

    result = AiSystemPrompts::StudentSnapshotPromptHelper.compile_prompt(template, variables)

    assert_equal "Unit Overview: ", result
  end

  # ---------------------------------------------------------------------------
  # get_insight_system_prompt / get_feedback_system_prompt
  # ---------------------------------------------------------------------------

  test 'get_insight_system_prompt compiles the Langfuse-sourced template when the fetch succeeds' do
    LangfuseHelper.stubs(:fetch_ta_prompt).returns(status: :ok, json: {'prompt' => 'Custom insight template for {{lesson_name}}', 'version' => 3})

    result = AiSystemPrompts::StudentSnapshotPromptHelper.get_insight_system_prompt(@lesson.id, @unit.id, @student.id, @teacher.id, @section.id)

    assert_equal "Custom insight template for #{@lesson.name}", result[:content]
    assert_equal "teaching-assistant/student-snapshot/lesson-insight", result[:prompt_name]
    assert_equal 3, result[:prompt_version]
  end

  test 'get_insight_system_prompt falls back to the local constant when the fetch fails' do
    LangfuseHelper.stubs(:fetch_ta_prompt).returns(status: 500, json: {error: 'boom'})

    result = AiSystemPrompts::StudentSnapshotPromptHelper.get_insight_system_prompt(@lesson.id, @unit.id, @student.id, @teacher.id, @section.id)

    assert_includes result[:content], "You are a teaching assistant for a computer science curriculum."
    assert_includes result[:content], "Lesson Name: #{@lesson.name}"
    refute_includes result[:content], "{{lesson_name}}"
    assert_nil result[:prompt_name]
    assert_nil result[:prompt_version]
  end

  test 'get_feedback_system_prompt compiles the Langfuse-sourced template when the fetch succeeds' do
    LangfuseHelper.stubs(:fetch_ta_prompt).returns(status: :ok, json: {'prompt' => 'Custom feedback template for {{lesson_name}}', 'version' => 2})

    result = AiSystemPrompts::StudentSnapshotPromptHelper.get_feedback_system_prompt(@lesson.id, @unit.id, @student.id, @teacher.id, @section.id)

    assert_equal "Custom feedback template for #{@lesson.name}", result[:content]
    assert_equal "teaching-assistant/student-snapshot/lesson-feedback", result[:prompt_name]
    assert_equal 2, result[:prompt_version]
  end

  test 'get_feedback_system_prompt falls back to the local constant when the fetch fails' do
    LangfuseHelper.stubs(:fetch_ta_prompt).returns(status: 500, json: {error: 'boom'})

    result = AiSystemPrompts::StudentSnapshotPromptHelper.get_feedback_system_prompt(@lesson.id, @unit.id, @student.id, @teacher.id, @section.id)

    assert_includes result[:content], "I need you to provide constructive student-facing feedback"
    assert_includes result[:content], "Lesson Name: #{@lesson.name}"
    refute_includes result[:content], "{{lesson_name}}"
    assert_nil result[:prompt_name]
    assert_nil result[:prompt_version]
  end
end
