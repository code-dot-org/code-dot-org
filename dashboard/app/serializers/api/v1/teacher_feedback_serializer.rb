# == Schema Information
#
# Table name: teacher_feedbacks
#
#  id         :integer          not null, primary key
#  comment    :text(65535)
#  student_id :integer
#  level_id   :integer
#  teacher_id :integer
#  performance :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_feedback_on_student_and_level                 (student_id,level_id)
#  index_feedback_on_student_and_level_and_teacher_id  (student_id,level_id,teacher_id)
#

class Api::V1::TeacherFeedbackSerializer < ActiveModel::Serializer
  attributes :id, :teacher_name, :student_id, :level_id, :script_level_id, :comment, :performance, :created_at

  private

  def teacher_name
    object.teacher.name
  end
end
