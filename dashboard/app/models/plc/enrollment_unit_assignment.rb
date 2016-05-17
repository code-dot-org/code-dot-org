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
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed'
  ]

  after_create :enroll_user_in_required_modules

  validates :status, inclusion: {in: UNIT_STATUS_STATES}

  def module_assignment_for_type(module_type)
    plc_module_assignments.joins(:plc_learning_module).find_by('plc_learning_modules.module_type': module_type)
  end

  def enroll_user_in_required_modules
    transaction do
      plc_course_unit.plc_learning_modules.required.each do |required_module|
        enroll_in_module required_module
      end
    end
  end

  def unlock_unit
    update(status: IN_PROGRESS)
  end

  def enroll_user_in_unit_with_learning_modules(learning_modules)
    transaction do
      Plc::LearningModule::NONREQUIRED_MODULE_TYPES.each do |module_type|
        module_assignment_for_type(module_type).try(:destroy)
      end

      learning_modules.each do |learning_module|
        enroll_in_module learning_module
      end

      update!(status: IN_PROGRESS)
    end
  end

  def check_for_unit_completion
    if !plc_task_assignments.joins(:plc_task).
        where.not('plc_tasks.type': Plc::LearningResourceTask.name).
        exists?(['status != ?', 'completed'])
      update!(status: COMPLETED)
    end
  end

  private
  def enroll_in_module(learning_module)
    return unless learning_module.plc_course_unit == plc_course_unit

    module_assignment = Plc::EnrollmentModuleAssignment.find_or_create_by(plc_enrollment_unit_assignment: self, plc_learning_module: learning_module)
    learning_module.plc_tasks.each do |task|
      Plc::EnrollmentTaskAssignment.find_or_create_by(
          plc_enrollment_module_assignment: module_assignment,
          plc_task: task,
          status: Plc::EnrollmentTaskAssignment::NOT_STARTED
      )
    end
  end
end
