module AiSystemPrompts::StudentSnapshotPromptHelper
  include LevelsHelper

  ALPHABET = ('a'..'z').to_a

  LEVEL_TYPE_PROMPTS =
    {
      "LevelGroup" => "Level Group: students interact with a group of levels that all display on a single page",
      "Aichat" => "AI chat level: students interact with an AI-powered chat interface.",
      "BubbleChoice" => "Bubble choice level: students select a sublevel to complete from multiple options.",
      "Multi" => "Multi: students respond to a multiple-choice question with a description and answer choices",
      "FreeResponse" => "Free Response: students respond to a question with a short text answer",
      "Pythonlab" => "Python Lab: students interact with a Python IDE to solve a coding problem",
      'Match' => 'Matching level: students match items from one column to another.',
      "External" => "External: students are shown a hyperlink with an external activity",
      "Panels" => "Panels: students view a set of slides with text",
      "Music" => "Music: students interact with a blockly-based music programming environment to solve a given problem",
      "ExternalLink" => "External Link: students are shown a hyperlink with an external activity",
      "Applab" => "Applab: students interact with a javascript app-design programming environment to solve a given problem",
      "StandaloneVideo" => "Standalone Video: students watch an instructional video",
      "NetSim" => "Net Simulator: students interact with an internet simulator widget",
      "Weblab2" => "Web Lab: students interact with a web IDE using HTML, CS, and JS to solve a given problem",
      "Sketchlab" => "Sketch Lab: students interact with a whiteboarding tool to create visual designs",
    }.freeze

  LESSON_INSIGHT_PROMPT = <<~INSIGHT_PROMPT
    You are a teaching assistant for a computer science curriculum. I need you to return a short summary of what a student has done on a specific lesson that contains multiple levels.
    Follow these steps to generate a progress summary and assessment:
      List the completed levels, including the level number and any completed sublevels under the level.
      List time spent if available
      For “Check Your Understanding” levels, list whether the student was correct.
      List the actions the student did during their assessment and what actions they spent most time on- debugging, writing code, running the code
    Write the following summary based on all info and above steps:
      Progress: Write 1-2 sentences about the student's progress through the levels, optional sublevels, and finally the assessment level. The student's performance on the assessment level is the most important.
      Misconceptions: Write 1-2 sentences about any of the student’s misconceptions in the lesson. If there are no misconceptions, say “Student showed no misconceptions”
      Assessment: Write 1-2 sentences specifically about the assessment level, including a brief description of what they did and what their program does. Write about what skills they did well on and/or need to improve on. Only include information about the assessment level.
      Next Steps: Write 1 sentence based on any misconceptions or issues with their code levels (especially the assessment level) with suggestions on what to do next. This could be going over concepts, trying additional levels or sublevels or just stating that they should continue on to the next lesson. Do not recommend completing additional sublevels if the student has completed one and there are no misconceptions.
    Use the following lesson info to complete the steps above:
  INSIGHT_PROMPT

  def self.get_insight_system_prompt(lesson_id, unit_id, student_id, teacher_id, section_id)
    general_prompt = get_student_snapshot_general_prompt(lesson_id, unit_id, student_id, teacher_id, section_id)

    "#{LESSON_INSIGHT_PROMPT}\n#{general_prompt}"
  end

  def self.get_feedback_system_prompt(lesson_id, unit_id, student_id, teacher_id, section_id)
    intro = "This is where the feedback system prompt intro goes."

    general_prompt = get_student_snapshot_general_prompt(lesson_id, unit_id, student_id, teacher_id, section_id)

    "#{intro}\n#{general_prompt}"
  end

  def self.get_student_snapshot_general_prompt(lesson_id, unit_id, student_id, teacher_id, section_id)
    unit = Unit.find(unit_id)
    unit_description = unit&.localized_description ? Services::MarkdownPreprocessor.process(unit.localized_description)&.gsub(/\n/, '. ')&.strip : nil

    lesson = Lesson.find(lesson_id)
    objectives = lesson.objectives.sort_by(&:description).map(&:description).to_json

    lesson_info = {
      "Lesson Name" => lesson.name,
      "Lesson Overview" => lesson.render_property(:overview)&.gsub(/\n/, '. ')&.strip,
      "Learning Objectives" => objectives,
      "Standards" => lesson.standards.map(&:summarize_for_lesson_show).to_json,
      "Unit Name" => unit.title_for_display,
      "Unit Overview" => "\"#{unit_description}\""
    }

    levels = lesson.levels.order(:position)
    assessment_level = lesson.levels.where(type: 'Pythonlab').last
    level_info_data = levels.map {|level| if assessment_level && level.id == assessment_level.id then get_full_level_prompt_info(level, student_id, unit.id, section_id, teacher_id) else get_brief_level_prompt_info(level, student_id, unit.id, section_id, teacher_id) end}

    lesson_info_str = lesson_info.map {|key, value| "#{key}: #{value}"}.join("\n")

    level_info_strings = level_info_data.map {|level_data| format_level_info(level_data)}

    "Use the following lesson info to generate your summary:

#{lesson_info_str}
Levels: [{
#{level_info_strings.join("\n},{\n")}
}]"
  end

  def self.get_level_number(level, script_level, parent_script_level = nil, parent_level_display_text = nil)
    if parent_script_level
      sublevel_index = parent_script_level.sublevel_position(level)
      index_letter = ALPHABET[sublevel_index - 1] unless sublevel_index.nil?
      parent_level_display_text.to_s + index_letter.to_s
    else
      if script_level&.respond_to?(:kind) && script_level.kind == "unplugged"
        nil
      else
        script_level&.level_display_text
      end
    end
  end

  # Get an abridged version of level info for prompt
  # This is used for non-assessment levels
  def self.get_brief_level_prompt_info(level, student_id, unit_id, section_id, teacher_id, parent_script_level = nil, parent_level_display_text = nil)
    return {} unless level

    user_level = UserLevel.find_by(user_id: student_id, level_id: level.id, script_id: unit_id)
    script_level = level.script_levels.first

    level_number = get_level_number(level, script_level, parent_script_level, parent_level_display_text)

    level_data = {
      'Level Number'=> level_number.to_s,
      "Level Type" => LEVEL_TYPE_PROMPTS[level.type] || level.type || '',
      "Number of attempts" => user_level&.attempts || 0
    }

    has_questions = !level.properties.nil? && level.properties["questions"].present?
    level_content = if has_questions then get_cfu_level_info(level, student_id, unit_id) else get_code_level_info(level, student_id, unit_id) end

    level_data.merge!({
                        "Was Submitted (only applicable for coding levels)" => user_level&.submitted,
      "Passing status" => user_level&.passing? || false,
      "Perfect status" => user_level&.perfect? || false,
      "Finished status" => user_level&.finished? || false
                      }
)

    level_data["Time spent"] = "#{user_level.time_spent} seconds" if user_level&.time_spent && user_level.time_spent > 0

    sublevel_data = []
    if script_level&.bubble_choice?
      sublevels = level.sublevels
      sublevel_data = sublevels&.any? ? sublevels.map {|sublevel| get_brief_level_prompt_info(sublevel, student_id, unit_id, section_id, teacher_id, level, level_number)} : []
    end

    rubric_data = level.rubrics.present? ? {learningGoals: level.rubrics&.flat_map(&:learning_goals)&.map(&:learning_goal)} : {}

    section_stats = get_section_stats_for_level(level, section_id, teacher_id, unit_id)

    {
      basic_info: level_data,
      level_content: level_content,
      sublevels: sublevel_data,
      rubrics: rubric_data,
      section_stats: section_stats
    }
  end

  # Get a detailed version of level info for prompt
  # This is used for assessment levels
  def self.get_full_level_prompt_info(level, student_id, unit_id, section_id, teacher_id, parent_script_level = nil, parent_level_display_text = nil)
    return {} unless level

    user_level = UserLevel.find_by(user_id: student_id, level_id: level.id, script_id: unit_id)
    script_level = level.script_levels.first

    level_number = get_level_number(level, script_level, parent_script_level, parent_level_display_text)

    level_data = {
      "Assessment Level" => "weight this more heavily towards student mastery",
      'Level Number'=> level_number.to_s,
      "Level Type" => LEVEL_TYPE_PROMPTS[level.type] || level.type || '',
      "Number of attempts" => user_level&.attempts || 0
    }

    sublevel_data = []
    if script_level&.bubble_choice?
      sublevels = level.sublevels
      sublevel_data = sublevels&.any? ? sublevels.map {|sublevel| get_full_level_prompt_info(sublevel, student_id, unit_id, section_id, teacher_id, level, level_number)} : []
    end

    section_stats = get_section_stats_for_level(level, section_id, teacher_id, unit_id)

    if user_level.nil? && sublevels.nil?
      level_data["Attempted"] = false
      return {
        basic_info: level_data,
        level_content: {},
        user_interactions: {},
        sublevels: [],
        rubrics: {},
        section_stats: section_stats,
        attempted: false
      }
    end

    level_data.merge!({
                        "Was Submitted (only applicable for coding levels)" => user_level&.submitted,
      "Passing status" => user_level&.passing? || false,
      "Perfect status" => user_level&.perfect? || false,
      "Finished status" => user_level&.finished? || false
                      }
)

    level_data["Time spent"] = "#{user_level.time_spent} seconds" if user_level&.time_spent && user_level.time_spent > 0

    rubric_data = level.rubrics.present? ? {learningGoals: level.rubrics&.flat_map(&:learning_goals)&.map(&:learning_goal)} : {}

    level_content = get_code_level_info(level, student_id, unit_id)

    user_interactions = get_user_level_interactions(level, student_id, unit_id)

    {
      basic_info: level_data,
      level_content: level_content,
      user_interactions: user_interactions,
      sublevels: sublevel_data,
      rubrics: rubric_data,
      section_stats: section_stats,
      attempted: true
    }
  end

  def self.get_cfu_level_info(level, student_id, unit_id)
    user_level = UserLevel.find_by(user_id: student_id, level_id: level.id, script_id: unit_id)
    student_response = get_student_response(user_level, level)

    {
      "Questions" => level.properties["questions"],
      "Answers" => level.properties["answers"],
      "Student Responses" => student_response
    }
  end

  def self.get_student_response(user_level, level)
    return "No attempt yet" unless user_level&.level_source&.data

    raw_data = user_level.level_source.data
    format_response_by_level_type(raw_data, level)
  end

  def self.get_section_stats_for_level(level, section_id, teacher_id, unit_id)
    section = Section.find_by(id: section_id)
    return {} unless section

    students = section.followers

    user_levels = UserLevel.where(
      user_id: students.pluck(:student_user_id),
      level_id: level.id,
      script_id: unit_id
    )

    time_spent_values = user_levels.map(&:time_spent).compact.select {|t| t > 0}

    median_time_spent = if time_spent_values.any?
                          sorted_times = time_spent_values.sort
                          len = sorted_times.length
                          if len.odd?
                            sorted_times[len / 2]
                          else
                            (sorted_times[(len / 2) - 1] + sorted_times[len / 2]) / 2.0
                          end
                        else
                          nil
                        end

    average_time_spent = time_spent_values.any? ? time_spent_values.sum.to_f / time_spent_values.length : nil

    total_students = students.count
    completed_students = user_levels.count(&:passing?)
    completion_percentage = total_students > 0 ? (completed_students.to_f / total_students * 100).round(1) : 0

    stats = {
      "Total students in section" => total_students,
      "Percentage of students who completed the level" => "#{completion_percentage}%"
    }

    stats["Section median time spent"] = "#{median_time_spent} seconds" if median_time_spent
    stats["Section average time spent"] = "#{average_time_spent.round(1)} seconds" if average_time_spent

    stats
  end

  def self.format_response_by_level_type(raw_data, level)
    case level.type
    when 'Multi'
      format_multi_response(raw_data, level)
    when 'Match'
      format_match_response(raw_data, level)
    when 'FreeResponse'
      raw_data.to_s
    else
      raw_data
    end
  end

  def self.format_multi_response(raw_data, level)
    answer_index = raw_data.to_i
    answers = level.properties["answers"] || []

    selected_answer = answers[answer_index]
    selected_answer || "Answer index #{answer_index} (answer not found)"
  end

  def self.format_match_response(raw_data, level)
    answer_indices = raw_data.split(',').map(&:to_i)
    questions = level.properties["questions"] || []
    answers = level.properties["answers"] || []

    answer_indices.map.with_index do |answer_idx, question_idx|
      question_text = questions[question_idx] || "Question #{question_idx}"
      answer_text = answers[answer_idx] || "Answer #{answer_idx}"
      "#{question_text} -> #{answer_text}"
    end.join("; ")
  end

  def self.get_code_level_info(level, student_id, unit_id)
    exemplar = level.respond_to?(:exemplar_sources) && level.exemplar_sources ? level.exemplar_sources : nil
    student_code = ApplicationController.helpers.get_student_code(student_id, level, unit_id).to_json

    code_data = {
      "Level Long Instructions" => "{#{ActionController::Base.helpers.strip_tags(level.long_instructions)&.gsub(/\s+/, ' ')&.strip || 'No long instructions'}}",
      "Level Short Instructions" => level.short_instructions,
      "Student Response" => student_code
    }

    code_data["Level Example Perfect Response"] = exemplar if exemplar
    code_data
  end

  def self.get_user_level_interactions(level, student_id, unit_id)
    user_level_interactions = UserLevelInteraction.where(user_id: student_id, level_id: level.id).
                                                  order(:created_at)

    return {} unless user_level_interactions.any?

    return user_level_interactions.map do |interaction|
      version_code = ApplicationController.helpers.get_student_code(student_id, level, unit_id, interaction.code_version)

      "#{interaction.created_at.strftime('%Y-%m-%d %H:%M:%S')} - #{interaction.interaction}: #{version_code.to_json}"
    end
  end

  def self.format_level_info(level_data, indentation = '  ')
    return "" if level_data.empty?

    basic_info_parts = []
    level_data[:basic_info]&.each do |key, value|
      basic_info_parts << "#{indentation}#{key}: #{value}" unless  value == ""
    end

    level_content_parts = []
    level_data[:level_content]&.each do |key, value|
      level_content_parts << "#{key}: #{value}"
    end

    section_stats_parts = []
    if level_data[:section_stats]&.any?
      section_stats_parts << "#{indentation}Section Stats:"
      level_data[:section_stats].each do |key, value|
        section_stats_parts << "#{indentation}  #{key}: #{value}"
      end
    end

    result_parts = []
    result_parts << basic_info_parts.join("\n") if basic_info_parts.any?
    result_parts << "#{indentation}#{level_content_parts.join("\n#{indentation}")}" if level_content_parts.any?

    if level_data[:user_interactions]&.any?
      user_interactions_parts = ["#{indentation}A list of all tracked actions the student took in chronological order. This includes the code that at the time of the action:"]
      level_data[:user_interactions].each do |interaction_string|
        user_interactions_parts << "#{indentation}  #{interaction_string}"
      end
      result_parts << user_interactions_parts.join("\n")
    end

    if level_data[:rubrics]&.any?
      result_parts << "#{indentation}Rubrics: #{level_data[:rubrics]}"
    end

    if level_data[:sublevels]&.any?
      sublevel_strings = level_data[:sublevels].map {|sublevel| format_level_info(sublevel, indentation + '  ')}
      result_parts << "#{indentation}Sublevels (A student picks one sublevel to complete and can optionally do more, but only one sublevel is required for mastery):\n#{indentation}[{\n#{sublevel_strings.join("\n#{indentation}},{\n")}}]"
    end

    result_parts << section_stats_parts.join("\n") if section_stats_parts.any?

    result_parts.join("\n")
  end
end
