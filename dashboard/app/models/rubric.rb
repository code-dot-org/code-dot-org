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
    }
  end
end
