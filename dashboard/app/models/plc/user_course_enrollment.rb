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
#  index_plc_user_course_enrollments_on_plc_course_id  (plc_course_id)
#  index_plc_user_course_enrollments_on_user_id        (user_id)
#

class Plc::UserCourseEnrollment < ActiveRecord::Base
  belongs_to :plc_course, class_name: '::Plc::Course'
  belongs_to :user, class_name: 'User'
  has_many :plc_unit_assignments, class_name: '::Plc::EnrollmentUnitAssignment', foreign_key: 'plc_user_course_enrollment_id', dependent: :destroy
  has_many :plc_module_assignments, through: :plc_unit_assignments, class_name: '::Plc::EnrollmentModuleAssignment', dependent: :destroy
  has_many :plc_task_assignments, through: :plc_unit_assignments, class_name: '::Plc::EnrollmentTaskAssignment', dependent: :destroy

  validates :user, presence: true
  validates :plc_course, presence: true

  after_create :create_enrollment_unit_assignments

  def create_enrollment_unit_assignments
    plc_course.plc_course_units.each do |course_unit|
      Plc::EnrollmentUnitAssignment.create(plc_user_course_enrollment: self,
                                           plc_course_unit: course_unit,
                                           status: Plc::EnrollmentUnitAssignment::START_BLOCKED)
    end
  end
end
