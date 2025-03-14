require 'test_helper'

class AitutorSystemPromptHelperTest < ActionView::TestCase
  include AitutorSystemPromptHelper

  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  setup do
    @unit = create(:script, :with_levels)
    @level = @unit.levels.first

    # Sample Javalab level
    @level_instructions = "Write a loop."
    @csa_unit = create(:csa_script)
    @javalab_level = create(:javalab, :with_instructions)
    create(:csa_script_level, levels: [@javalab_level])

    # Creating a Pythonlab level with a validation_file
    @pythonlab_level = create(:pythonlab, :with_instructions)
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
    level_instructions = AitutorSystemPromptHelper.get_level_instructions(@javalab_level)
    assert_includes level_instructions, 'Write a loop.'
  end

  test "get_validated_level_test_file_contents for validated Javalab level" do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)
    test_contents = "these are the tests"
    @javalab_level.validation = {"Validation.java" => {"text" => test_contents}}
    test_file_contents = AitutorSystemPromptHelper.get_validated_level_test_file_contents(@javalab_level)
    assert_includes test_file_contents, test_contents
  end

  test "get_validated_level_test_file_contents for non-validated Javalab level" do
    no_tests_msg = AitutorSystemPromptHelper.get_validated_level_test_file_contents(@level)
    assert_includes no_tests_msg, 'no tests'
  end

  test "get_validated_level_test_file_contents for validated Pythonlab level" do
    # Add a sample Pythonlab validation_file
    sample_test_file_contents = "import unittest\nfrom factorial import factorial\n\nclass TestFactorial(unittest.TestCase):\n\n  def test_factorial_zero(self):\n      self.assertEqual(factorial(0), 1)"
    @pythonlab_level.properties["validation_file"] = {
      "id" => "3",
      "name" => "test_factorial.py",
      "language" => "py",
      "contents" => sample_test_file_contents
    }
    test_file_contents = AitutorSystemPromptHelper.get_validated_level_test_file_contents(@pythonlab_level)
    assert_includes test_file_contents, sample_test_file_contents
  end

  test "get_validated_level_test_file_contents for non-validated Pythonlab level" do
    # Create a Pythonlab level without a validation_file for this test
    @pythonlab_level.properties["validation_file"] = nil
    no_tests_msg = AitutorSystemPromptHelper.get_validated_level_test_file_contents(@pythonlab_level)
    assert_includes no_tests_msg, 'There are no tests for this level.'
  end

  test "get_system_prompt with level_id and script_id" do
    base_system_prompt_snippet = "You are responding to a student's query about programming."
    system_prompt = AitutorSystemPromptHelper.get_system_prompt(@javalab_level.id, @csa_unit.id)
    assert_includes system_prompt, base_system_prompt_snippet
    assert_includes system_prompt, 'Java'
    assert_includes system_prompt, 'Write a loop.'
    assert_includes system_prompt, 'no tests'
  end

  test "get_system_prompt without level_id and script_id" do
    base_system_prompt_snippet = "You are responding to a student's query about programming."
    system_prompt = AitutorSystemPromptHelper.get_system_prompt(nil, nil)
    assert_includes system_prompt, base_system_prompt_snippet
    refute_includes system_prompt, 'Python'
    refute_includes system_prompt, 'Write a loop.'
    refute_includes system_prompt, 'no tests'
  end
end
