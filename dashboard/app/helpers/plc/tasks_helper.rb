module Plc::TasksHelper
  def options_for_plc_tasks
    #Probably better to hardcode this - this list isn't going to change that much
    ['Plc::LearningResourceTask', 'Plc::ScriptCompletionTask'].map {|name| [name.underscore.sub('plc/', '').gsub('_', ' ').titleize, name]}
  end
end