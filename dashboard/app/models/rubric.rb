# == Schema Information
#
# Table name: rubrics
#
#  id         :bigint           not null, primary key
#  lesson_id  :integer          not null
#  level_id   :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_rubrics_on_lesson_id_and_level_id  (lesson_id,level_id) UNIQUE
#
class Rubric < ApplicationRecord
  has_many :learning_goals, -> {order(:position)}, dependent: :destroy, inverse_of: :rubric
  belongs_to :level
  belongs_to :lesson

  def get_script_level
    lesson.script_levels.find {|sl| sl.levels.include?(level)}
  end

  def summarize
    script_level = get_script_level
    {
      id: id,
      learningGoals: learning_goals.map(&:summarize),
      script: {
        id: get_script_level.script.id,
      },
      lesson: {
        name: lesson.name,
        position: lesson.relative_position,
      },
      level: {
        id: level.id,
        name: level.name,
        position: script_level&.position,
      }
    }
  end

  accepts_nested_attributes_for :learning_goals, allow_destroy: true

  def seeding_key(seed_context)
    my_lesson = seed_context.lessons.find {|l| l.id == lesson_id}
    my_lesson.seeding_key(seed_context)
  end

  def summarize_for_rubric_edit
    {
      id: id,
      lessonId: lesson_id,
      levelId: level_id,
      learningGoals: learning_goals.map(&:summarize_for_rubric_edit),
      initialSystemPrompt: get_system_prompt,
      initialAiRubric: get_ai_rubric,
    }
  end

  private def get_system_prompt
    script_level = get_script_level
    s3_lesson_name = AiRubricConfig.get_lesson_s3_name(script_level)
    AiRubricConfig.read_file_from_s3(s3_lesson_name, 'system_prompt.txt')
  end

  # returns an array of hashes, each hash representing a row in the rubric:
  # [
  #   {
  #     "Key Concept": "Modularity - Multiple Sprites",
  #     "Instructions": "(1) list the name of each sprite created. (2) ...",
  #     "Extensive Evidence": "At least 3 sprites created ...",
  #     "Convincing Evidence": "At least 2 sprite created ...",
  #     "Limited Evidence": "At least 1 sprite created...",
  #     "No Evidence": "No sprites are used in the program."
  #   },
  #   ...
  # ]
  private def get_ai_rubric
    script_level = get_script_level
    s3_lesson_name = AiRubricConfig.get_lesson_s3_name(script_level)
    ai_rubric_csv = AiRubricConfig.read_file_from_s3(s3_lesson_name, 'standard_rubric.csv')
    CSV.parse(ai_rubric_csv, headers: true).map(&:to_h)
  end
end
