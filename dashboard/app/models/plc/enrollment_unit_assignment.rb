# Plc::EnrollmentUnitAssignment represents a user's enrollment in a specific course unit
# == Schema Information
#
# Table name: plc_enrollment_unit_assignments
#
#  id                            :integer          not null, primary key
#  plc_user_course_enrollment_id :integer
#  plc_course_unit_id            :integer
#  status                        :string(255)
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#
# Indexes
#
#  enrollment_unit_assignment_course_enrollment_index  (plc_user_course_enrollment_id)
#  enrollment_unit_assignment_course_unit_index        (plc_course_unit_id)
#

class Plc::EnrollmentUnitAssignment < ActiveRecord::Base
  belongs_to :plc_user_course_enrollment, class_name: '::Plc::UserCourseEnrollment'
  belongs_to :plc_course_unit, class_name: '::Plc::CourseUnit'

  has_many :plc_module_assignments, class_name: '::Plc::EnrollmentModuleAssignment', foreign_key: 'plc_enrollment_unit_assignment_id', dependent: :destroy
  has_many :plc_task_assignments, through: :plc_module_assignments, class_name: '::Plc::EnrollmentTaskAssignment', dependent: :destroy

  UNIT_STATUS_STATES = [
    START_BLOCKED = 'start_blocked',
    PENDING_EVALUATION = 'pending_evaluation',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed'
  ]

  validates :status, inclusion: {in: UNIT_STATUS_STATES}

  def enroll_user_in_unit_with_learning_modules(learning_modules)
    transaction do
      plc_module_assignments.destroy_all

      learning_modules.each do |learning_module|
        module_assignment = Plc::EnrollmentModuleAssignment.find_or_create_by(plc_enrollment_unit_assignment: self, plc_learning_module: learning_module)
        learning_module.plc_tasks.each do |task|
          Plc::EnrollmentTaskAssignment.find_or_create_by(plc_enrollment_module_assignment: module_assignment,
                                                          plc_task: task, status: :not_started,
                                                          type: task.class.task_assignment_type.name)

        end
      end
      self.update(status: IN_PROGRESS)
    end
  end

  def check_for_unit_completion
    if !plc_task_assignments.joins(:plc_task).
        where.not('plc_tasks.type': Plc::LearningResourceTask.name).
        exists?(['status != ?', 'completed'])
      update!(status: COMPLETED)
    end
  end

  def status_and_icon_and_color_and_icon_color
    case status
      when START_BLOCKED
        return status.titleize, 'fa fa-minus-circle', 'rgba(255, 0, 0, .1)', 'red'
      when PENDING_EVALUATION
        return status.titleize, 'fa fa-question-circle', 'rgba(0, 0, 255, .1)', 'blue'
      when IN_PROGRESS
        return status.titleize, 'fa fa-adjust', 'rgba(202, 165, 20, .1)', 'goldenrod'
      when COMPLETED
        return status.titleize, 'fa fa-check-circle', 'rgba(0, 255, 0, .1)', 'green'
    end
  end
end
