# == Schema Information
#
# Table name: teacher_feedbacks
#
#  id          :integer          not null, primary key
#  comment     :text(65535)
#  student_id  :integer
#  level_id    :integer
#  teacher_id  :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  deleted_at  :datetime
#  performance :string(255)
#
# Indexes
#
#  index_feedback_on_student_and_level                 (student_id,level_id)
#  index_feedback_on_student_and_level_and_teacher_id  (student_id,level_id,teacher_id)
#

class TeacherFeedback < ApplicationRecord
  acts_as_paranoid # use deleted_at column instead of deleting rows
  validates_presence_of :student_id, :level_id, :teacher_id, unless: :deleted?
  belongs_to :student, class_name: 'User'
  has_many :student_sections, class_name: 'Section', through: :student, source: 'sections_as_student'
  belongs_to :level
  belongs_to :teacher, class_name: 'User'

  def self.get_student_level_feedback(student_id, level_id, teacher_id)
    where(
      student_id: student_id,
      level_id: level_id,
      teacher_id: teacher_id
    ).latest
  end

  def self.latest_per_teacher
    #Only select feedback from teachers who lead sections in which the student is still enrolled
    find(
      joins(:student_sections).
        where('sections.user_id = teacher_id').
        group([:teacher_id, :student_id]).
        pluck('MAX(teacher_feedbacks.id)')
    )
  end

  def self.latest
    find_by(id: maximum(:id))
  end
end
