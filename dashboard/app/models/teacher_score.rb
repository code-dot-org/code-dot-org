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
    section,
    stage_id,
    score
  )
    student_ids = section.students.pluck(:id)
    stage = Stage.find(stage_id) # Get from cache?
    script_id = stage.script_id
    level_ids = stage.script_levels.map(&:level_id)

    student_ids.each do |student_id|
      level_ids.each do |level_id|
        TeacherScore.score_level_for_student(
          section.user_id,
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

  def self.get_level_scores_for_script_for_section(script_id, section_id)
    level_scores_by_student_by_stage_by_script = {}
    stage_ids = Script.find(script_id).stages.pluck(:id)
    stage_student_level_scores = {}
    stage_ids.each do |stage_id|
      level_scores = get_level_scores_for_stage_for_section(stage_id, section_id)
      unless level_scores.empty?
        stage_student_level_scores[stage_id] = level_scores
      end
    end
    level_scores_by_student_by_stage_by_script[script_id] = stage_student_level_scores
    level_scores_by_student_by_stage_by_script
  end

  def self.get_level_scores_for_stage_for_section(stage_id, section_id)
    student_ids = Section.find(section_id).students.pluck(:id)
    student_level_scores = {}
    student_ids.each do |student_id|
      level_scores = get_level_scores_for_stage_for_student(stage_id, student_id)
      unless level_scores.empty?
        student_level_scores[student_id] = level_scores
      end
    end
    student_level_scores
  end

  def self.get_level_scores_for_stage_for_student(stage_id, student_id)
    stage = Stage.find(stage_id)
    script_id = stage.script.id
    level_ids = stage.script_levels.map(&:level_id)
    user_levels = UserLevel.where(user_id: student_id, level_id: level_ids, script_id: script_id)
    level_scores = {}
    user_levels.each do |user_level|
      teacher_score = TeacherScore.where(
        user_level_id: user_level.id
      )&.order("created_at")&.last&.score
      if teacher_score
        level_scores[user_level.level_id] = teacher_score
      end
    end
    level_scores
  end
end
