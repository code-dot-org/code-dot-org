# == Schema Information
#
# Table name: plc_enrollment_task_assignments
#
#  id                                  :integer          not null, primary key
#  status                              :string(255)
#  plc_enrollment_module_assignment_id :integer
#  plc_task_id                         :integer
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#  type                                :string(255)
#  properties                          :text(65535)
#
# Indexes
#
#  task_assignment_module_assignment_index  (plc_enrollment_module_assignment_id)
#  task_assignment_task_index               (plc_task_id)
#

class Plc::EnrollmentTaskAssignment < ActiveRecord::Base
  belongs_to :plc_enrollment_module_assignment, class_name: '::Plc::EnrollmentModuleAssignment'
  belongs_to :plc_task, class_name: '::Plc::Task'

  validates :plc_enrollment_module_assignment, presence: true

  after_update :check_unit_completion

  include SerializedProperties
  include StiFactory

  def complete_assignment!
    update!(status: :completed)
  end

  def check_unit_completion
    plc_enrollment_module_assignment.plc_enrollment_unit_assignment.check_for_unit_completion
  end

  def get_icon_and_style
    return plc_task.try(:icon), '' if plc_task.try(:icon)

    case status
      # Need to move these statuses to some constant eventually - will address with next checkin
      when 'not_started'
        return 'fa-circle-o', ''
      when 'in_progress'
        return 'fa-adjust', 'color: darkgoldenrod'
      when 'completed'
        return 'fa-check-circle', 'color: green'
    end
  end
end
