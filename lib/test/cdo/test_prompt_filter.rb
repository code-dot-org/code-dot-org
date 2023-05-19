require 'cdo/prompt_filter'
require_relative '../test_helper'

class PromptFilterTest < Minitest::Test
  def teardown
    OpenAI.unstub(:gpt)
  end

  def test_valid_prompt_returns_200
    student_prompt = "A valid prompt without offensive content"

    OpenAI.stub(:gpt, "0") do
      assert_equal 200, PromptFilter.find_potential_content_violations(student_prompt)
    end
  end

  def test_offensive_prompt_raises_exception
    student_prompt = "An offensive prompt with discriminatory content"

    OpenAI.stub(:gpt, "1") do
      assert_raises(Exception) do
        PromptFilter.find_potential_content_violations(student_prompt)
      end
    end
  end

  def test_unexpected_response_raises_exception
    student_prompt = "A prompt with unexpected response"

    OpenAI.stub(:gpt, "2") do
      assert_raises(Exception) do
        PromptFilter.find_potential_content_violations(student_prompt)
      end
    end
  end

  def test_long_prompt_contains_no_offensive_content
    student_prompt = "A long prompt that doesn't contain offensive content" * 100

    OpenAI.stub(:gpt, "0") do
      assert_equal 200, PromptFilter.find_potential_content_violations(student_prompt)
    end
  end
end
