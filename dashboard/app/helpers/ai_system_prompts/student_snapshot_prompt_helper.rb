module AiSystemPrompts::StudentSnapshotPromptHelper
  include LevelsHelper

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

  def self.get_insight_system_prompt(lesson_id, unit_id, student_id, teacher_id, section_id)
    intro = "This is where the insight system prompt intro goes. Weight the assessment level more heavily."

    general_prompt = get_student_snapshot_general_prompt(lesson_id, unit_id, student_id, teacher_id, section_id)

    "#{intro}\n#{general_prompt}"
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

  # Get an abridged version of level info for prompt
  # This is used for non-assessment levels
  def self.get_brief_level_prompt_info(level, student_id, unit_id, section_id, teacher_id)
    return {} unless level

    user_level = UserLevel.find_by(user_id: student_id, level_id: level.id, script_id: unit_id)

    level_data = {
      "Level Name" => level.display_name || (!level.properties.nil? && level.properties["title"]) || level.name,
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

    sublevels = level.respond_to?(:sublevels) ? level.sublevels&.order(:position) : nil
    sublevel_data = sublevels&.any? ? sublevels.map {|sublevel| get_brief_level_prompt_info(sublevel, student_id, unit_id, section_id, teacher_id)} : []

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
  def self.get_full_level_prompt_info(level, student_id, unit_id, section_id, teacher_id)
    return {} unless level

    user_level = UserLevel.find_by(user_id: student_id, level_id: level.id, script_id: unit_id)

    level_data = {
      "Assessment Level - weight this more heavily towards student mastery" => "",
      "Level Name" => level.display_name || (!level.properties.nil? && level.properties["title"]) || level.name,
      "Level Type" => LEVEL_TYPE_PROMPTS[level.type] || level.type || '',
      "Number of attempts" => user_level&.attempts || 0
    }

    sublevels = level.respond_to?(:sublevels) ? level.sublevels&.order(:position) : nil
    sublevel_data = sublevels&.any? ? sublevels.map {|sublevel| get_full_level_prompt_info(sublevel, student_id, unit_id, section_id, teacher_id)} : []

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
      result_parts << "#{indentation}Sublevels (A student should pick at least one to complete):\n#{indentation}[{\n#{sublevel_strings.join("\n#{indentation}},{\n")}}]"
    end

    result_parts << section_stats_parts.join("\n") if section_stats_parts.any?

    result_parts.join("\n")
  end
end
