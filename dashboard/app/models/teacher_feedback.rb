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

#don't store sections id in model

class TeacherFeedback < ApplicationRecord
  validates_presence_of :student_id, :section_id, :level_id
  belongs_to :student, class_name: 'User'
  has_many :sections, through: :student
  has_many :section_students, through: :sections, source: :students

  def initialize(params)
    puts "In initializer: #{params}"
    super params
    puts "DONE"
    puts valid?
  end
end
