require 'cdo/shared_constants'

# Helper methods for generating system prompts for AI shared across
# AI Tutor v1 and Evaluate Student Learning.
module AiSystemPrompts::SystemPromptHelper
  def self.get_basic_system_prompt(level)
    base_prompt =
      "You are an expert Computer Science teacher. Your students are in grades: #{level.grade_levels}. \n\n #{get_level_instructions(level)}"
    if level.upper_grades_programming_level?
      base_prompt += get_starter_code(level)
      base_prompt += get_validated_level_test_file_contents(level)
    end
    base_prompt + "\n\n"
  end

  def self.get_level_instructions(level)
    level_instructions = level.properties["long_instructions"]
    "Your students have been given the following instructions: \n\n #{level_instructions} \n"
  end

  def self.get_starter_code(level)
    "\n Here is the starter code for this level: \n\n #{level.get_starter_code} \n"
  end

  def self.get_validated_level_test_file_contents(level)
    test_file_contents = ""

    # Note: Not all Lab2 levels have the same validation structure
    if level.type == 'Pythonlab'
      validation_file = level.properties["validation_file"]
      if validation_file && validation_file["contents"]
        test_file_contents += validation_file["contents"]
      end
    elsif level.respond_to?(:validation) && level.validation && level.validation.values.any?
      level.validation.each_value do |validation|
        test_file_contents += validation["text"]
      end
    end

    test_file_contents.empty? ?
      "\n There are no tests for this level." :
      "\n The contents of the test file are: #{test_file_contents}"
  end

  def self.get_level(level_id)
    level = nil
    if level_id
      level = begin Level.find(level_id)
      rescue ActiveRecord::RecordNotFound
        Honeybadger.notify(exception,
            error_message: 'Invalid level_id in system prompt helper',
            context: {
              level_id: level_id,
              user_id: current_user.id
            }
          )
      end
    end
    level
  end
end
