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

class Plc::ScriptCompletionTask < Plc::Task
  serialized_attrs %w(script_id)

  def script
    script_id ? Script.find(script_id) : nil
  end

  def self.check_for_script_completion user_script
    if user_script.completed_at && user_script.script.pd
      #Get all the task assignments for the user for script level tasks

      #I'm not wild about the joinery here - we can definitely save time by adding denormalizing user_id on the
      #enrollment_task_assignment table. The number of script completions tasks associated with a user won't be that
      #high, so it's okay to select all of them and pick the ones we want
      task_assignments_for_user = (Plc::UserCourseEnrollment.where(user: user_script.user).map {|x| x.plc_task_assignments.all}).flatten
      tasks_to_update = task_assignments_for_user.select {|x| x.plc_task.type == 'Plc::ScriptCompletionTask' && x.plc_task.script_id == script.id}
      tasks_to_update.map(&:complete_assignment)
    end
  end
end
