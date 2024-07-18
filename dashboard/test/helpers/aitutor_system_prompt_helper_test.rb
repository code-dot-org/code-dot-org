require 'test_helper'

class AitutorSystemPromptHelperTest < ActionView::TestCase
  include AitutorSystemPromptHelper

  setup do
    @unit = create(:script, :with_levels)
    @level = @unit.levels.first

    @csa_unit = create(:csa_script)
    @javalab_level = create(:javalab)
    create(:csa_script_level, levels: [@javalab_level])

    @write_a_loop = "Write a loop."
    @level.properties["long_instructions"] = @write_a_loop

    @no_tests = "no tests"
  end

  test "get_programming_language_system_prompt includes Java for CSA level" do
    programming_language_system_prompt = AitutorSystemPromptHelper.get_programming_language_system_prompt(@csa_unit)
    assert_includes programming_language_system_prompt, 'Java'
  end

  test "get_programming_language_system_prompt includes Python for non-CSA level" do
    programming_language_system_prompt = AitutorSystemPromptHelper.get_programming_language_system_prompt(@unit)
    assert_includes programming_language_system_prompt, 'Python'
  end

  test "get_level_instructions" do
    level_instructions = AitutorSystemPromptHelper.get_level_instructions(@level)
    assert_includes level_instructions, @write_a_loop
  end

  test "get_validated_level_test_file_contents for validated level" do
    # TODO: figure out how to handle this case given that the file contents are encrypted/decrypted
    # test_file_contents = AitutorSystemPromptHelper.get_validated_level_test_file_contents(@javalab_level)
  end

  test "get_validated_level_test_file_contents for non-validated level" do
    no_tests_msg = AitutorSystemPromptHelper.get_validated_level_test_file_contents(@level)
    assert_includes no_tests_msg, @no_tests
  end

  test "get_system_prompt" do
    base_system_prompt_snippet = "As an AI assistant"
    system_prompt = AitutorSystemPromptHelper.get_system_prompt(@level, @unit)
    assert_includes system_prompt, base_system_prompt_snippet
    assert_includes system_prompt, 'Python'
    assert_includes system_prompt, @write_a_loop
    assert_includes system_prompt, @no_tests
  end
end
