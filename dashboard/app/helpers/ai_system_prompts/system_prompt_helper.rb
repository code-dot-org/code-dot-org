require 'cdo/shared_constants'

# Helper methods for generating system prompts for AI shared across
# AI Tutor and Evaluate Student Learning.
module AiSystemPrompts::SystemPromptHelper
  def self.get_basic_system_prompt(level, unit)
    base_prompt =
      "You are an expert Computer Science teacher. Your students are in grades: #{get_grade_levels(unit)}. The programming language they are learning is #{get_programming_language(unit)}. They are working on a level where they have been asked to #{get_level_instructions(level)}."
    if programming_level?(level)
      base_prompt += get_starter_code(level)
      base_prompt += get_validated_level_test_file_contents(level)
    end
    base_prompt
  end

  def self.get_grade_levels(unit)
    unit.get_course_version.course_offering.grade_levels
  end

  # TODO: see if there's a better way to do this maybe via marketing info for course catalog?
  # TODO: also see if there's a unit description that would be helpful. There's one for courses,
  # but it might be too broad.
  def self.get_programming_language(unit)
    if unit.csa?
      "Java"
    elsif unit.csp?
      "JavaScript"
    else
      "Python"
    end
  end

  def self.programming_level?(level)
    level.upper_grades_programming_level?
  end

  def self.get_level_instructions(level)
    level_instructions = level.properties["long_instructions"]
    "\n Here are the student instructions for this level: #{level_instructions}"
  end

  def self.get_starter_code(level)
    "\n Here is the starter code for this level: #{level.get_starter_code}"
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

  def self.get_unit(unit_id)
    unit = nil
    if unit_id
      unit = begin Unit.find(unit_id)
      rescue ActiveRecord::RecordNotFound
        Honeybadger.notify(exception,
            error_message: 'Invalid unit_id in system prompt helper',
            context: {
              unit_id: unit_id,
              user_id: current_user.id
            }
          )
      end
    end
    unit
  end
end
