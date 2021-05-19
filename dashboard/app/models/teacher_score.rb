# == Schema Information
#
# Table name: teacher_scores
#
#  id            :integer          not null, primary key
#  user_level_id :bigint           unsigned
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
  def self.score_lesson_for_section(
    section_id,
    lesson_id,
    score
  )
    section = Section.find(section_id)
    student_ids = section.students.pluck(:id)
    teacher_id = section.user_id
    lesson = Lesson.find(lesson_id)
    script_id = lesson.script.id
    level_ids = lesson.script_levels.map(&:level_id)

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

  def self.get_level_scores_for_script_for_section(script_id, section_id, page)
    level_scores_by_student_by_lesson_by_script = {}
    # Teacher scores are currently only relevant for unplugged lessons
    lessons = Script.find(script_id).lessons.select(&:unplugged)
    student_ids = Section.find(section_id).students.page(page).per(50).pluck(:id)
    lesson_student_level_scores = {}
    lessons.each do |lesson|
      level_scores = get_level_scores_for_lesson_for_students(lesson, student_ids)
      unless level_scores.empty?
        lesson_student_level_scores[lesson.id] = level_scores
      end
    end
    level_scores_by_student_by_lesson_by_script[script_id] = lesson_student_level_scores
    level_scores_by_student_by_lesson_by_script
  end

  def self.get_level_scores_for_lesson_for_students(lesson, student_ids)
    script_id = lesson.script_id
    level_ids = lesson.script_levels.map(&:level_id)
    user_levels = UserLevel.select(:id, :level_id, :user_id).where(user_id: student_ids, level_id: level_ids, script_id: script_id)

    teacher_scores = TeacherScore.select(:score, :created_at, :user_level_id).where(
      user_level_id: user_levels.pluck(:id)
    )

    level_scores_by_student = {}
    student_ids.each do |student_id|
      student_user_levels = user_levels.select {|u_l| u_l.user_id == student_id}
      student_level_score = {}
      student_user_levels.each do |u_l|
        teacher_score = teacher_scores.select {|t_s| t_s.user_level_id == u_l.id}.sort_by(&:created_at).last&.score
        if teacher_score
          student_level_score[u_l.level_id] = teacher_score
        end
      end
      unless student_level_score.empty?
        level_scores_by_student[student_id] = student_level_score
      end
    end
    level_scores_by_student
  end
end
