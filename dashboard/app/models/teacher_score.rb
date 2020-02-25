# == Schema Information
#
# Table name: teacher_scores
#
#  id            :integer          not null, primary key
#  user_level_id :integer
#  teacher_id    :integer
#  score         :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_teacher_scores_on_user_level_id  (user_level_id)
#

class TeacherScore < ApplicationRecord
  def self.score_stage_for_section(
    teacher_id,
    section_id,
    stage_id,
    score
  )
    student_ids = Section.find(section_id).students.pluck(:id)
    stage = Stage.find(stage_id)
    script_id = stage.script.id
    level_ids = stage.script_levels.map(&:level_id)

    student_ids.each do |student_id|
      level_ids.each do |level_id|
        TeacherScore.score_level_for_student(
          teacher_id,
          student_id,
          level_id,
          script_id,
          score
        )
      end
    end
  end

  def self.score_level_for_student(
    teacher_id,
    student_id,
    level_id,
    script_id,
    score
  )
    user_level = UserLevel.find_or_create_by(user_id: student_id, level_id: level_id, script_id: script_id)

    TeacherScore.create(
      user_level_id: user_level.id,
      teacher_id: teacher_id,
      score: score
    )
  end
end
