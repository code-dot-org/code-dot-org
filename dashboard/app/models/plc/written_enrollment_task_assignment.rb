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

class Plc::WrittenEnrollmentTaskAssignment < Plc::EnrollmentTaskAssignment
  #Things like other peer reviews will go here
  serialized_attrs %w(submission)

  def get_icon_and_style
    case status
      when 'not_started'
        return 'fa-circle-o', 'color: black'
      when 'in_progress'
        return 'fa-adjust', 'color: goldenrod'
      when 'review_rejected'
        return 'fa-exclamation-circle', 'color: red'
      when 'complete'
        return 'fa-check-circle', 'color: green'
    end
  end

end
