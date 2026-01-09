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

  def self.get_insight_system_prompt(lesson_id, unit_id, student_id, teacher_id)
    intro = "This is where the insight system prompt intro goes.\n"
    general_prompt = get_student_snapshot_general_prompt(lesson_id, unit_id, student_id, teacher_id)

    "#{intro}\n#{general_prompt}"
  end

  def self.get_feedback_system_prompt(lesson_id, unit_id, student_id, teacher_id)
    intro = "This is where the feedback system prompt intro goes."
    general_prompt = get_student_snapshot_general_prompt(lesson_id, unit_id, student_id, teacher_id)

    "#{intro}
    #{general_prompt}"
  end

  def self.get_student_snapshot_general_prompt(lesson_id, unit_id, student_id, teacher_id)
    unit = Unit.find(unit_id)
    unit_description = unit&.localized_description ? Services::MarkdownPreprocessor.process(unit.localized_description) : nil

    lesson = Lesson.find(lesson_id)
    objectives = lesson.objectives.sort_by(&:description).map(&:description).to_json

    lesson_info = "Lesson Name: #{lesson.name}
    Lesson Overview: #{lesson.render_property(:overview)}
    Learning Objectives: #{objectives}
    Standards: #{lesson.standards.map(&:summarize_for_lesson_show).to_json}
    Unit Name: #{unit.title_for_display}
    Unit Overview: \"#{unit_description}\""

    levels = lesson.levels.order(:position)
    # Special cases to think about:
    # - Choice levels (probably skip in v0)
    # - Survey levels/lessons (Don't ever need?)
    # - Unplugged levels (skip)
    # - Videos (skip)
    # - teacher feedback - not in AIF, skip
    level_info = levels.map {|level| get_level_prompt_info(level, student_id, unit.id)}

    "Use the following lesson info to generate your summary:\n#{lesson_info}\n
Levels: [{\n  #{level_info.join("\n},{\n  ")}\n}]"
  end

  def self.get_level_prompt_info(level, student_id, unit_id)
    return unless level

    sublevels = level.respond_to?(:sublevels) ? level.sublevels&.order(:position) : nil
    sublevel_info = sublevels&.any? ? "Sublevels (A student should pick at least one to complete): [#{sublevels.map {|sublevel| get_level_prompt_info(sublevel, student_id, unit_id)}.join(", ")}]" : ""
    rubric_summary = level.rubrics.present? ? {learningGoals: level.rubrics&.flat_map(&:learning_goals)&.map(&:learning_goal)} : 'N/A'

    user_level = UserLevel.find_by(user_id: student_id, level_id: level.id, script_id: unit_id)

    has_questions = !level.properties.nil? && level.properties["questions"].present?
    level_info = if has_questions then get_cfu_level_info(level, student_id, unit_id) else get_code_level_info(level, student_id, unit_id) end

    basic_info = "  {Level Name: #{level.display_name || (!level.properties.nil? && level.properties["title"]) || level.name}
    Level Id (for debugging: remove before merge): #{level.id}
    Level Type: #{LEVEL_TYPE_PROMPTS[level.type] || level.type || ''}
    Number of attempts: #{user_level&.attempts || 0}"

    # only show basic info if user hasn't attempted the level
    return basic_info if user_level.nil?

    "#{basic_info}
    #{level_info}
    Was Submitted (only applicable for coding levels): #{user_level&.submitted}
    Passing status: #{user_level&.passing? || false}
    Perfect status: #{user_level&.perfect? || false}
    Finished status: #{user_level&.finished? || false}
    Validation Status: ___
    Time spent: #{user_level&.time_spent || 0} seconds
    Rubrics: #{rubric_summary}
    #{sublevel_info}}\n"
  end

  def self.get_cfu_level_info(level, student_id, unit_id)
    user_level = UserLevel.find_by(user_id: student_id, level_id: level.id, script_id: unit_id)
    student_response = get_student_response(user_level, level)

    "Questions: #{level.properties["questions"]}
    Answers: #{level.properties["answers"]}
    Student Responses: #{student_response}"
  end

  def self.get_student_response(user_level, level)
    return "No attempt yet" unless user_level&.level_source&.data

    raw_data = user_level.level_source.data
    format_response_by_level_type(raw_data, level)
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
    exemplar = level.respond_to?(:exemplar_sources) ? "\nLevel Example Perfect Response: #{level.exemplar_sources}\n" : ""
    student_code = ApplicationController.helpers.get_student_code(student_id, level, unit_id).to_json
    "Level Long Instructions: {#{ActionController::Base.helpers.strip_tags(level.long_instructions)&.gsub(/\s+/, ' ')&.strip || 'No long instructions'}}
    Level Short Instructions: #{level.short_instructions}#{exemplar}
    Student Response: #{student_code}"
  end
end
