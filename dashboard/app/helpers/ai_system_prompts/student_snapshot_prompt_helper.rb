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
    sublevels = level.respond_to?(:sublevels) ? level.sublevels&.order(:position) : nil
    sublevel_info = sublevels&.any? ? "Sublevels (A student should pick at least one to complete): [#{sublevels.map {|sublevel| get_level_prompt_info(sublevel, student_id, unit_id)}.join(", ")}]" : ""
    rubric_summary = level.rubrics.present? ? {learningGoals: level.rubrics&.flat_map(&:learning_goals)&.map(&:learning_goal)} : 'N/A'

    student_code = ApplicationController.helpers.get_student_code(student_id, level, unit_id).to_json

    "  {Level Name: #{level.display_name || level.name}
    Level Type: #{LEVEL_TYPE_PROMPTS[level.type] || level.type || ''}
    Level Long Instructions: {#{ActionController::Base.helpers.strip_tags(level.long_instructions)&.gsub(/\s+/, ' ')&.strip || 'No long instructions'}}
    Level Short Instructions: #{level.short_instructions}
    Base Code:
    Student Response: #{student_code}
    Validation Status: ___
    Time spent: ___
    Exemplar code?: ___
    Rubrics: #{rubric_summary}
    #{sublevel_info}}\n"
  end
end
