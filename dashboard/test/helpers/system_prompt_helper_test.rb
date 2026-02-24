require 'test_helper'

class AiSystemPrompts::SystemPromptHelperTest < ActionView::TestCase
  include AiSystemPrompts::SystemPromptHelper

  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  setup do
    @unit = create(:script, :in_single_unit_course, :with_levels)
    @level = @unit.levels.first

    # Sample Applab level
    @applab_level = create(:applab, :with_instructions)
    @csp_unit = create(:csp_script, :in_single_unit_course)
    create(:csp_script_level, levels: [@applab_level])

    # Sample Javalab level
    @level_instructions = "Write a loop."
    @csa_unit = create(:csa_script, :in_single_unit_course)
    @javalab_level = create(:javalab, :with_instructions)
    create(:csa_script_level, levels: [@javalab_level])

    # Creating a Pythonlab level with a validation_file
    @pythonlab_level = create(:pythonlab, :with_instructions)
  end

  test "get_level_instructions" do
    level_instructions = AiSystemPrompts::SystemPromptHelper.get_level_instructions(@javalab_level)
    assert_includes level_instructions, 'Write a loop.'
  end

  test "get_validated_level_test_file_contents for validated Javalab level" do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)
    test_contents = "these are the tests"
    @javalab_level.validation = {"Validation.java" => {"text" => test_contents}}
    test_file_contents = AiSystemPrompts::SystemPromptHelper.get_validated_level_test_file_contents(@javalab_level)
    assert_includes test_file_contents, test_contents
  end

  test "get_validated_level_test_file_contents for non-validated Javalab level" do
    no_tests_msg = AiSystemPrompts::SystemPromptHelper.get_validated_level_test_file_contents(@level)
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
    test_file_contents = AiSystemPrompts::SystemPromptHelper.get_validated_level_test_file_contents(@pythonlab_level)
    assert_includes test_file_contents, sample_test_file_contents
  end

  test "get_validated_level_test_file_contents for non-validated Pythonlab level" do
    # Create a Pythonlab level without a validation_file for this test
    @pythonlab_level.properties["validation_file"] = nil
    no_tests_msg = AiSystemPrompts::SystemPromptHelper.get_validated_level_test_file_contents(@pythonlab_level)
    assert_includes no_tests_msg, 'There are no tests for this level.'
  end
end
