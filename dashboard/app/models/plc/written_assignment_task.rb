# == Schema Information
#
# Table name: plc_tasks
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  type       :string(255)      default("Plc::Task"), not null
#  properties :text(65535)
#

class Plc::WrittenAssignmentTask < Plc::Task
  serialized_attrs %w(assignment_description)

  def self.task_assignment_type
    Plc::WrittenEnrollmentTaskAssignment
  end
end
