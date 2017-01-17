# == Schema Information
#
# Table name: pd_attendances
#
#  id               :integer          not null, primary key
#  pd_session_id    :integer          not null
#  teacher_id       :integer
#  created_at       :datetime
#  updated_at       :datetime
#  deleted_at       :datetime
#  pd_enrollment_id :integer
#
# Indexes
#
#  index_pd_attendances_on_pd_enrollment_id              (pd_enrollment_id)
#  index_pd_attendances_on_pd_session_id_and_teacher_id  (pd_session_id,teacher_id) UNIQUE
#

class Pd::Attendance < ActiveRecord::Base
  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  belongs_to :session, class_name: 'Pd::Session', foreign_key: :pd_session_id
  belongs_to :teacher, class_name: 'User', foreign_key: :teacher_id
  belongs_to :enrollment, class_name: 'Pd::Enrollment', foreign_key: :pd_enrollment_id

  has_one :workshop, class_name: 'Pd::Workshop', through: :session

  validate :teacher_or_enrollment_must_be_present
  def teacher_or_enrollment_must_be_present
    if teacher.nil? && enrollment.nil?
      errors.add(:base, 'Teacher or enrollment must be present.')
    end
  end

  before_save :find_matching_enrollment
  def find_matching_enrollment
    self.enrollment = workshop.enrollments.find_by(user_id: teacher_id) unless enrollment
  end

  def self.for_teacher(teacher)
    where(teacher_id: teacher.id)
  end

  def self.for_workshop(workshop)
    joins(:workshop).where(pd_workshops: {id: workshop.id})
  end

  def self.distinct_teachers
    User.where(id: all.select(:teacher_id).distinct)
  end
end
