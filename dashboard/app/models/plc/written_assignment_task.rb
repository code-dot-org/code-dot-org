# == Schema Information
#
# Table name: plc_tasks
#
#  id                     :integer          not null, primary key
#  name                   :string(255)
#  plc_learning_module_id :integer
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  type                   :string(255)      default("Plc::Task"), not null
#  properties             :text(65535)
#
# Indexes
#
#  index_plc_tasks_on_plc_learning_module_id  (plc_learning_module_id)
#

class Plc::WrittenAssignmentTask < Plc::Task
  serialized_attrs %w(assignment_description)

  def self.task_assignment_type
    Plc::WrittenEnrollmentTaskAssignment
  end
end
