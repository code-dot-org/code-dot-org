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
  has_many :plc_module_assignments, class_name: '::Plc::EnrollmentModuleAssignment', foreign_key: 'plc_user_course_enrollment_id', dependent: :destroy
  has_many :plc_task_assignments, through: :plc_module_assignments, class_name: '::Plc::EnrollmentTaskAssignment', dependent: :destroy

  validates :user, presence: true
  validates :plc_course, presence: true

  def enroll_user_in_course_with_learning_modules(learning_modules)
    transaction do
      plc_module_assignments.destroy_all

      learning_modules.each do |learning_module|
        module_assignment = Plc::EnrollmentModuleAssignment.find_or_create_by(plc_user_course_enrollment: self, plc_learning_module: learning_module)

        learning_module.plc_tasks.each do |task|
          Plc::EnrollmentTaskAssignment.find_or_create_by(plc_enrollment_module_assignment: module_assignment,
                                                          plc_task: task, status: :not_started,
                                                          type: task.class.task_assignment_type.name)
        end
      end
    end

    self.status = :in_progress
    self.save!
  end

  def check_for_course_completion
    if !plc_task_assignments.exists?(['status != ?', 'completed'])
      update!(status: :completed)
    end
  end
end
