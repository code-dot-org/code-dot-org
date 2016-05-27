module Plc::TasksHelper
  def options_for_plc_tasks
    #Probably better to hardcode this - this list isn't going to change that much
    [['Script Completion Task', 'Plc::ScriptCompletionTask'], ['Written Assignment Task', 'Plc::WrittenAssignmentTask'],['Learning Resource', 'Plc::LearningResourceTask']]
  end
end
