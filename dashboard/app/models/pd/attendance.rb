# == Schema Information
#
# Table name: pd_attendances
#
#  id                :integer          not null, primary key
#  pd_session_id     :integer          not null
#  teacher_id        :integer
#  created_at        :datetime
#  updated_at        :datetime
#  deleted_at        :datetime
#  pd_enrollment_id  :integer
#  marked_by_user_id :integer
#
# Indexes
#
#  index_pd_attendances_on_marked_by_user_id             (marked_by_user_id)
#  index_pd_attendances_on_pd_enrollment_id              (pd_enrollment_id)
#  index_pd_attendances_on_pd_session_id_and_teacher_id  (pd_session_id,teacher_id) UNIQUE
#  index_pd_attendances_on_teacher_id                    (teacher_id)
#

class Pd::Attendance < ApplicationRecord
  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  belongs_to :session, class_name: 'Pd::Session', foreign_key: :pd_session_id
  belongs_to :teacher, class_name: 'User', foreign_key: :teacher_id
  belongs_to :enrollment, class_name: 'Pd::Enrollment', foreign_key: :pd_enrollment_id
  belongs_to :marked_by_user, class_name: 'User', foreign_key: :marked_by_user_id

  has_one :workshop, class_name: 'Pd::Workshop', through: :session

  validate :teacher_or_enrollment_must_be_present, unless: :deleted?

  before_save :save_matching_enrollment_association, :update_enrollment_user

  alias_method :user, :teacher

  def teacher_or_enrollment_must_be_present
    if teacher.nil? && enrollment.nil?
      errors.add(:base, 'Teacher or enrollment must be present.')
    end
  end

  def save_matching_enrollment_association
    self.enrollment = resolve_enrollment
  end

  def update_enrollment_user
    return unless enrollment && user
    enrollment.update!(user: user)
  end

  def resolve_enrollment
    Pd::Enrollment.with_deleted.find_by(id: pd_enrollment_id) ||
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
  # @param search_params [Hash] params to search, or create by
  # @return [Pd::Attendance] resulting attendance model
  def self.find_restore_or_create_by!(search_params)
    attendance = nil
    Retryable.retryable(on: ActiveRecord::RecordNotUnique) do
      attendance = Pd::Attendance.with_deleted.find_by(search_params) ||
        Pd::Attendance.create!(search_params)
    end

    attendance.restore! if attendance.deleted?
    attendance
  end
end
