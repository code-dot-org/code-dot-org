# == Schema Information
#
# Table name: user_lesson_reflections
#
#  id         :bigint           not null, primary key
#  lesson_id  :integer          not null
#  student_id :bigint           not null
#  success    :text(65535)
#  struggle   :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_user_lesson_reflections_on_lesson_id                  (lesson_id)
#  index_user_lesson_reflections_on_lesson_id_and_student_id   (lesson_id,student_id)
#  index_user_lesson_reflections_on_student_id                 (student_id)
#
class UserLessonReflection < ApplicationRecord
  belongs_to :lesson
  belongs_to :student, class_name: 'User'
end
