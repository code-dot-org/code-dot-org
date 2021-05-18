# == Schema Information
#
# Table name: teacher_feedbacks
#
#  id                       :integer          not null, primary key
#  comment                  :text(65535)
#  student_id               :integer
#  level_id                 :integer
#  teacher_id               :integer
#  performance              :string
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  deleted_at               :datetime
#  performance              :string(255)
#  student_visit_count      :integer
#  student_first_visited_at :datetime
#  student_last_visited_at  :datetime
#  script_level_id          :integer          not null
#  seen_on_feedback_page_at :datetime
#
# Indexes
#
#  index_feedback_on_student_and_level                 (student_id,level_id)
#  index_feedback_on_student_and_level_and_teacher_id  (student_id,level_id,teacher_id)
#

class Api::V1::TeacherFeedbackSerializer < ActiveModel::Serializer
  attributes :id, :teacher_name, :feedback_provider_id, :student_id, :script_id, :level_id, :comment, :performance, :created_at, :student_seen_feedback, :review_state, :student_last_updated
  def teacher_name
    object.teacher.name
  end

  def feedback_provider_id
    object.teacher.id
  end

  def student_last_updated
    object.student_last_updated
  end

  def student_seen_feedback
    visited_feedback_page_at = object.seen_on_feedback_page_at
    visited_project_page_at = object.student_last_visited_at
    return visited_feedback_page_at if visited_feedback_page_at && visited_feedback_page_at > object.created_at
    return visited_project_page_at if visited_project_page_at && visited_project_page_at > object.created_at
  end
end
