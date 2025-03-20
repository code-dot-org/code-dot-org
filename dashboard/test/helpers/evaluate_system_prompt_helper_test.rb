require 'test_helper'

class AiSystemPrompts::EvaluateSystemPromptHelperTest < ActionView::TestCase
  include AiSystemPrompts::EvaluateSystemPromptHelper

  setup do
    csp_course_offering = create(:csp_course_offering, :with_units)
    @level_instructions = "Write a loop."
    @applab_level = create(:applab, :with_instructions)
    @csp_unit = csp_course_offering.course_versions.first.content_root
    create(:csp_script_level, levels: [@applab_level])
  end

  test "get_system_prompt for AppLab level unit" do
    base_system_prompt_snippet = "Please review the student's work."
    system_prompt = AiSystemPrompts::EvaluateSystemPromptHelper.get_system_prompt(@applab_level, @csp_unit)
    assert_includes system_prompt, base_system_prompt_snippet
    assert_includes system_prompt, 'JavaScript'
    assert_includes system_prompt, 'Write a loop.'
    assert_includes system_prompt, 'no tests'
    assert_includes system_prompt, @level_instructions
  end
end
