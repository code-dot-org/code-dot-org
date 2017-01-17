# == Schema Information
#
# Table name: plc_user_course_enrollments
#
#  id            :integer          not null, primary key
#  status        :string(255)
#  plc_course_id :integer
#  user_id       :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_plc_user_course_enrollments_on_plc_course_id              (plc_course_id)
#  index_plc_user_course_enrollments_on_user_id_and_plc_course_id  (user_id,plc_course_id) UNIQUE
#

class Plc::UserCourseEnrollment < ActiveRecord::Base
  belongs_to :plc_course, class_name: '::Plc::Course'
  belongs_to :user, class_name: 'User'
  has_many :plc_unit_assignments, class_name: '::Plc::EnrollmentUnitAssignment', foreign_key: 'plc_user_course_enrollment_id', dependent: :destroy
  has_many :plc_module_assignments, through: :plc_unit_assignments, class_name: '::Plc::EnrollmentModuleAssignment', dependent: :destroy

  validates :user, presence: true
  validates :plc_course, presence: true

  validates :user_id, uniqueness: {scope: :plc_course_id}, on: :create

  after_save :create_enrollment_unit_assignments

  def self.enroll_users(user_emails, course_id)
    course = Plc::Course.find(course_id)
    enrolled_users = []
    nonexistent_users = []
    nonteacher_users = []
    other_failure_users = []
    other_failure_errors = []

    user_emails.each do |email|
      user = User.find_by_email_or_hashed_email(email)

      if user.nil?
        nonexistent_users << email
      elsif !user.teacher?
        nonteacher_users << email
      else
        enrollment = find_or_create_by(user: user, plc_course: course)
        if enrollment.valid?
          enrolled_users << email
        else
          other_failure_users << email
          other_failure_errors << enrollment.errors
        end
      end
    end

    return enrolled_users, nonexistent_users, nonteacher_users, other_failure_users, other_failure_errors
  end

  def create_enrollment_unit_assignments
    plc_course.plc_course_units.each do |course_unit|
      Plc::EnrollmentUnitAssignment.create(plc_user_course_enrollment: self,
                                           plc_course_unit: course_unit,
                                           status: course_unit.started ? Plc::EnrollmentUnitAssignment::IN_PROGRESS : Plc::EnrollmentUnitAssignment::START_BLOCKED,
                                           user: user)
    end
  end
end
