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

  # When a teacher marks a stage complete for a section, that stage is marked
  # complete for all students in the section; thus to check for section stage
  # completion, we can check stage completion for any student in that section.
  def self.teacher_marked_stage_complete_for_section(teacher_id, section_id, stage_id)
    student_ids = Section.find(section_id).students.pluck(:id)
    student_ids.each do |student_id|
      unless TeacherScore.teacher_marked_stage_complete_for_student?(stage_id, student_id, teacher_id)
        return false
      end
    end
    return true
  end

  def self.teacher_marked_stage_complete_for_student?(stage_id, student_id, teacher_id)
    stage = Stage.find(stage_id)
    level_count = stage.script_levels.map(&:level_id).count
    scores = TeacherScore.get_level_scores_for_stage_for_student(stage_id, student_id, teacher_id).values
    return scores.count == level_count && scores.uniq.length == 1 && scores.first == 100
  end

  def self.get_level_scores_for_stage_for_student(stage_id, student_id, teacher_id)
    stage = Stage.find(stage_id)
    script_id = stage.script.id
    level_ids = stage.script_levels.map(&:level_id)
    user_levels = UserLevel.where(user_id: student_id, level_id: level_ids, script_id: script_id)
    level_scores = {}
    user_levels.each do |user_level|
      level_scores[user_level.level_id] =
        TeacherScore.where(
          user_level_id: user_level.id,
          teacher_id: teacher_id
        ).order("created_at").last.score
    end
    level_scores
  end
end
