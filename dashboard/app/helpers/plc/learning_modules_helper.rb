module Plc::LearningModulesHelper
  def options_for_plc_task_learning_modules
    Plc::LearningModule.all.map {|learning_module| [learning_module.name, learning_module.id]}.sort
  end
end
