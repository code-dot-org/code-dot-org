require 'test_helper'

class AitutorSystemPromptHelperTest < ActionView::TestCase
  include AitutorSystemPromptHelper

  setup do
    @unit = create(:script, :with_levels)
    @level = @unit.levels.first

    @csa_unit = create(:csa_script, :with_levels)
    @csa_level = @csa_unit.levels.first
  end

  test "get_programming_language_system_prompt includes Java for CSA level" do
    programming_language_system_prompt = AitutorSystemPromptHelper.get_programming_language_system_prompt(@csa_unit)
    assert_includes programming_language_system_prompt, 'Java'
  end

  test "get_programming_language_system_prompt includes Python for on CSA level" do
    programming_language_system_prompt = AitutorSystemPromptHelper.get_programming_language_system_prompt(@unit)
    assert_includes programming_language_system_prompt, 'Python'
  end

  # Get level instructions gets instructions
  # Get validated test files not validated
  # Get validated test files validated, no files
  # Get validated test files validated gets files
  # Get system prompt includes base + lang + instructions + tests
end
