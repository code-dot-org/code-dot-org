module AiSystemPrompts::StudentSnapshotPromptHelper
  def self.get_insight_system_prompt(lesson_id, unit_id, student_id, teacher_id)
    intro = "This is where the insight system prompt intro goes."
    general_prompt = get_student_snapshot_general_prompt(lesson_id, unit_id, student_id, teacher_id)

    "#{intro}
    #{general_prompt}"
  end

  def self.get_feedback_system_prompt(lesson_id, unit_id, student_id, teacher_id)
    intro = "This is where the feedback system prompt intro goes."
    general_prompt = get_student_snapshot_general_prompt(lesson_id, unit_id, student_id, teacher_id)

    "#{intro}
    #{general_prompt}"
  end

  def self.get_student_snapshot_general_prompt(lesson_id, unit_id, student_id, teacher_id)
    lesson_info = "Lesson Name: ___
    Lesson Overview: ___
    Learning Objectives: ___
    Standards: ___
    Unit Name: ___
    Unit Overview: ___"

    levels = []
    # Special cases to think about:
    # - Choice levels (probably skip in v0)
    # - Survey levels/lessons (Don't ever need?)
    # - Unplugged levels (skip)
    # - Videos (skip)
    # - teacher feedback - not in AIF, skip
    level_info = levels.map do |_level|
      "Level Name: ___
      Level Type: ___
      Level Instructions: ___
      Student Response: (either student code or CFU response)
      Validation Status: ___
      Time spent: ___
      Exemplar code?: ___
      Rubrics?: ___ (do we want to include this?)"
    end

    "Use the following lesson info to generate your summary: #{lesson_info}
    Levels: [{#{level_info.join('}, {')}}]"
  end
end
