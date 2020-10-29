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

# Maps a user to a course they are enrolled in.
#
# Normally created when a teacher enrolls in a workshop with a corresponding PLC course.
class Plc::UserCourseEnrollment < ActiveRecord::Base
  belongs_to :plc_course, class_name: '::Plc::Course'
  belongs_to :user, class_name: 'User'
  has_many :plc_unit_assignments, class_name: '::Plc::EnrollmentUnitAssignment', foreign_key: 'plc_user_course_enrollment_id', dependent: :destroy
  has_many :plc_module_assignments, through: :plc_unit_assignments, class_name: '::Plc::EnrollmentModuleAssignment', dependent: :destroy

  validates :user, presence: true
  validates :plc_course, presence: true

  validates :user_id, uniqueness: {scope: :plc_course_id}, on: :create

  after_save :create_enrollment_unit_assignments, :create_authorized_teacher_user_permission
  before_destroy :delete_authorized_teacher_user_permission

  # Method for
  # @param user_keys: list of user IDs or email addresses
  # @param course_id: course_id to enroll users in
  # @returns list of enrolled users, user_keys that did not correspond to extant users, user_keys that belonged to students, or user_emails that failed for other reasons
  def self.enroll_users(user_keys, course_id)
    plc_course = Plc::Course.find(course_id)
    enrolled_users = []
    nonexistent_users = []
    nonteacher_users = []
    other_failure_users = []
    other_failure_errors = []

    user_keys.each do |user_key|
      user = user_key =~ /^\d+$/ ? User.find(user_key) : User.find_by_email_or_hashed_email(user_key)

      email = user.try(:email)

      if user.nil?
        nonexistent_users << user_key
      elsif !user.teacher?
        nonteacher_users << user_key
      else
        enrollment = find_or_create_by(user: user, plc_course: plc_course)
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
      Plc::EnrollmentUnitAssignment.create(
        plc_user_course_enrollment: self,
        plc_course_unit: course_unit,
        status: course_unit.started ? Plc::EnrollmentUnitAssignment::IN_PROGRESS : Plc::EnrollmentUnitAssignment::START_BLOCKED,
        user: user
      )
    end
  end

  def summarize
    {
      courseName: plc_course.name,
      link: Rails.application.routes.url_helpers.course_path(plc_course.unit_group),
      status: status,
      courseUnits: plc_unit_assignments.sort_by {|a| a.plc_course_unit.unit_order || 0}.map do |unit_assignment|
        {
          unitName: unit_assignment.plc_course_unit.unit_name,
          link: Rails.application.routes.url_helpers.script_path(unit_assignment.plc_course_unit.script),
          moduleAssignments: unit_assignment.summarize_progress,
          status: unit_assignment.status
        }
      end
    }
  end

  private

  def create_authorized_teacher_user_permission
    unless user.authorized_teacher?
      user.permission = UserPermission::AUTHORIZED_TEACHER
    end
  end

  def delete_authorized_teacher_user_permission
    # De-authorize teacher unless they have other plc enrollments
    unless user.plc_enrollments.length > 1
      UserPermission.find_by(
        user_id: user_id,
        permission: UserPermission::AUTHORIZED_TEACHER
      ).try(:destroy)
    end
  end
end
