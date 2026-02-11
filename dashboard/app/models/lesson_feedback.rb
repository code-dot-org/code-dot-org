# == Schema Information
#
# Table name: lesson_feedbacks
#
#  id                 :bigint           not null, primary key
#  teacher_id         :integer
#  student_id         :integer
#  section_id         :bigint
#  lesson_id          :integer
#  saved_feedback     :text(65535)
#  submitted_feedback :text(65535)
#  submitted_at       :datetime
#  resources          :json
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_lesson_feedbacks_on_lesson_student  (lesson_id,student_id) UNIQUE
#
class LessonFeedback < ApplicationRecord
  belongs_to :teacher, class_name: 'User'
  belongs_to :student, class_name: 'User'

  validates :lesson_id, :student_id, :teacher_id
  validates :lesson_id, uniqueness: {scope: :student_id}
end
