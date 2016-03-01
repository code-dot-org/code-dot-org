module Plc::TasksHelper
  def options_for_plc_tasks
    #Probably better to hardcode this - this list isn't going to change that much
    [['Plc::LearningResourceTask', 'Learning Resource'],['Plc::ScriptCompletionTask', 'Script Completion Task']]
  end
end
