module Plc::TasksHelper
  def options_for_plc_tasks
    #Probably better to hardcode this - this list isn't going to change that much
    [['Learning Resource', 'Plc::LearningResourceTask'],['Script Completion Task', 'Plc::ScriptCompletionTask']]
  end
end
