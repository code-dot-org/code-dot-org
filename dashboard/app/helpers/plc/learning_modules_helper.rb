module Plc::LearningModulesHelper
  def options_for_plc_task_learning_modules
    Plc::LearningModule.all.pluck(:name, :id).sort
  end
end
