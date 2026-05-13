require 'test_helper'

class AiSystemPrompts::EvaluateSystemPromptHelperTest < ActionView::TestCase
  include AiSystemPrompts::EvaluateSystemPromptHelper

  setup do
    csp_course_offering = create(:csp_course_offering, :with_unit_group)
    @level_instructions = "Write a loop."
    @base_system_prompt_snippet = "review the student's work."
    @applab_level = create(:applab, :with_instructions)
    @csp_unit = csp_course_offering.course_versions.first.content_root.first_unit
    create(:csp_script_level, levels: [@applab_level])
  end

  test "get_system_prompt for AppLab level" do
    system_prompt = AiSystemPrompts::EvaluateSystemPromptHelper.get_system_prompt(
      @applab_level, SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]
    )
    assert_includes system_prompt, @base_system_prompt_snippet
    assert_includes system_prompt, 'no tests'
    assert_includes system_prompt, @level_instructions
    refute_includes system_prompt, 'skillEvaluations'
  end

  test "get_system_prompt for AppLab level with skills" do
    skill = create(:skill)
    create(:levels_skill, level: @applab_level, skill: skill)
    system_prompt = AiSystemPrompts::EvaluateSystemPromptHelper.get_system_prompt(
      @applab_level, SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]
    )
    assert_includes system_prompt, @base_system_prompt_snippet
    assert_includes system_prompt, 'no tests'
    assert_includes system_prompt, @level_instructions
    assert_includes system_prompt, 'skillEvaluations'
    assert_includes system_prompt, skill.evaluation_criteria
  end

  test "get_system_prompt for free response level" do
    free_response_level = create(:free_response, :with_instructions)
    create(:csp_script_level, levels: [free_response_level])
    system_prompt = AiSystemPrompts::EvaluateSystemPromptHelper.get_system_prompt(
      free_response_level, SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]
    )
    assert_includes system_prompt, @base_system_prompt_snippet
    assert_includes system_prompt, @level_instructions
    refute_includes system_prompt, 'skillEvaluations'
  end

  test "get_system_prompt includes additional_ai_evaluation_instructions if present" do
    applab_level_with_directions = create(:applab, :with_instructions)
    additional_instructions = "Please pay special attention to variable naming."
    applab_level_with_directions.stubs(:additional_ai_evaluation_instructions).returns(additional_instructions)
    create(:csp_script_level, levels: [applab_level_with_directions])
    system_prompt = AiSystemPrompts::EvaluateSystemPromptHelper.get_system_prompt(
      applab_level_with_directions, SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]
    )
    assert_includes system_prompt, additional_instructions
  end
end
