# == Schema Information
#
# Table name: teacher_feedbacks
#
#  id         :integer          not null, primary key
#  comment    :text(65535)
#  student_id :integer
#  level_id   :integer
#  section_id :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_feedback_on_student_and_level_and_section_id  (student_id,level_id,section_id)
#

class TeacherFeedback < ApplicationRecord
  validates :student_id, presence: true
  validates :section_id, presence: true
  validates :level_id, presence: true
end
