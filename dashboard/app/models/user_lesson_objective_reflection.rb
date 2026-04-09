# == Schema Information
#
# Table name: user_lesson_objective_reflections
#
#  id           :bigint           not null, primary key
#  objective_id :integer          not null
#  student_id   :bigint           not null
#  reflection   :string(255)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_ulor_on_objective_and_student                      (objective_id,student_id)
#  index_user_lesson_objective_reflections_on_objective_id  (objective_id)
#  index_user_lesson_objective_reflections_on_student_id    (student_id)
#
class UserLessonObjectiveReflection < ApplicationRecord
  belongs_to :objective
  belongs_to :student, class_name: 'User'
end
