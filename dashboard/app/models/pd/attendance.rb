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

  before_save :save_matching_enrollment_association
  def save_matching_enrollment_association
    self.enrollment = resolve_enrollment
  end

  def resolve_enrollment
    enrollment ||
      workshop.enrollments.find_by(user_id: teacher_id) ||
      workshop.enrollments.find_by(email: User.with_deleted.find_by(id: teacher_id).try(&:email))
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

  # Idempotent: Find existing, restore deleted, or create a new attendance row.
  def self.find_restore_or_create_by!(attendance_params)
    attendance = nil
    Retryable.retryable(on: ActiveRecord::RecordNotUnique) do
      attendance = Pd::Attendance.with_deleted.find_by(attendance_params) ||
        Pd::Attendance.create!(attendance_params)
    end
    attendance.restore if attendance.deleted?
    attendance
  end
end
