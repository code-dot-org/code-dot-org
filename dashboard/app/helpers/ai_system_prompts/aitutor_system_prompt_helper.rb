module AiSystemPrompts::AitutorSystemPromptHelper
  def self.get_system_prompt(level_id, unit_id)
    level = AiSystemPrompts::SystemPromptHelper.get_level(level_id)
    unit = AiSystemPrompts::SystemPromptHelper.get_unit(unit_id)

    system_prompt = get_base_system_prompt
    system_prompt << get_programming_language_system_prompt(unit) if unit
    system_prompt << AiSystemPrompts::SystemPromptHelper.get_level_instructions(level) if level
    system_prompt << AiSystemPrompts::SystemPromptHelper.get_validated_level_test_file_contents(level) if level

    #end_of_prompt = "next message should start with [fixed-code-solution], followed by [pedagogical-guiding-answer-markdown], and end with [end-of-response]."
    #system_prompt << "\n\n#{end_of_prompt}"

    system_prompt
  end

  def self.get_base_system_prompt
    base_system_prompt = "You are responding to a query about programming.  Target the reading age of an American 7th grader.  Use the Socratic method to guide the student to the answer, but do not give them the answer directly.  Just focus on the biggest single issue you find.  Use plain English in the answer.  I don't want multiple steps, points, or questions.  Just one question that helps the student to make progress.  Feel free to look back at earlier attempts to determine whether the user needs extra hints, especially if they seem to be stuck.  If you notice the same code being tried more than three times in a row, telling the user the actual answer."

    # Two extra things: show in parentheses how many time the same code has been attempted in a row, and also show in parentheses how many times the student has asked for help at all."

    base_system_prompt
  end

  def self.get_programming_language_system_prompt(unit)
    language = AiSystemPrompts::SystemPromptHelper.get_programming_language(unit)
    "\n Specific Exclusions: Refrain from discussing topics not explicitly related to computer
    science or #{language} programming."
  end
end
