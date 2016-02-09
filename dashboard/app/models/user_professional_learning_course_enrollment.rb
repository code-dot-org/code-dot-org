# == Schema Information
#
# Table name: user_professional_learning_course_enrollments
#
#  id                              :integer          not null, primary key
#  user_id                         :integer
#  professional_learning_course_id :integer
#  status                          :string(255)
#
# Indexes
#
#  enrollment_plc_index                                            (professional_learning_course_id)
#  index_user_professional_learning_course_enrollments_on_user_id  (user_id)
#

class UserProfessionalLearningCourseEnrollment < ActiveRecord::Base
  belongs_to :user
  belongs_to :professional_learning_course
  has_many :user_enrollment_module_assignment
  has_many :user_module_task_assignment, through: :user_enrollment_module_assignment

  def self.enroll_user_in_course_with_learning_modules(user, course, learning_modules)
    enrollment = UserProfessionalLearningCourseEnrollment.find_or_create_by(user: user, professional_learning_course: course, status: :in_progress)

    learning_modules.each do |learning_module|
      module_assignment = UserEnrollmentModuleAssignment.find_or_create_by(user_professional_learning_course_enrollment: enrollment, professional_learning_module: learning_module)

      learning_module.professional_learning_tasks.each do |task|
        UserModuleTaskAssignment.find_or_create_by(user_enrollment_module_assignment: module_assignment, professional_learning_task: task, status: :not_started)
      end
    end

    enrollment
  end

  def complete_course
    self.status = :completed
    self.save!
  end
end
