module Plc::LearningModulesHelper
  def options_for_plc_task_learning_modules
    Plc::LearningModule.all.pluck(:name, :id).sort
  end

  def options_for_evaluation_answer_modules(course_unit)
    course_unit.plc_learning_modules.order(:required, :name).pluck(:id, :required, :name).map do |id, required, name|
      # Boo Ruby, you can't add nil to a string without choking?
      ["#{name}#{' - Required' if required}", id]
    end
  end
end
