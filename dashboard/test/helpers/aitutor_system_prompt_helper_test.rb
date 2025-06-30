require 'test_helper'

class AiSystemPrompts::AitutorSystemPromptHelperTest < ActionView::TestCase
  include AiSystemPrompts::AitutorSystemPromptHelper

  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  setup do
    @unit = create(:script, :with_levels, :in_single_unit_course)
    @level = @unit.levels.first

    # Sample Javalab level
    @level_instructions = "Write a loop."
    @csa_unit = create(:csa_script, :in_single_unit_course)
    @javalab_level = create(:javalab, :with_instructions)
    create(:csa_script_level, levels: [@javalab_level])

    # Creating a Pythonlab level with a validation_file
    @pythonlab_level = create(:pythonlab, :with_instructions)
  end

  test "get_system_prompt with level_id and script_id" do
    base_system_prompt_snippet = "You are responding to a student's query about programming."
    system_prompt = AiSystemPrompts::AitutorSystemPromptHelper.get_system_prompt(@javalab_level.id, @csa_unit.id)
    assert_includes system_prompt, base_system_prompt_snippet
    assert_includes system_prompt, 'Write a loop.'
    assert_includes system_prompt, 'no tests'
  end

  test "get_system_prompt without level_id and script_id" do
    base_system_prompt_snippet = "You are responding to a student's query about programming."
    system_prompt = AiSystemPrompts::AitutorSystemPromptHelper.get_system_prompt(nil, nil)
    assert_includes system_prompt, base_system_prompt_snippet
    refute_includes system_prompt, 'Write a loop.'
    refute_includes system_prompt, 'no tests'
  end
end
