module Plc::LearningModulesHelper
  def options_for_plc_task_learning_modules
    Plc::LearningModule.all.pluck(:name, :id).sort
  end

  def options_for_evaluation_answer_modules(course_unit)
    course_unit.plc_learning_modules.order(:required, :name).map do |learning_module|
      # Boo Ruby, you can't add nil to a string without choking?
      [learning_module.name += (' - Required' if learning_module.required).to_s, learning_module.id]
    end
  end
end
