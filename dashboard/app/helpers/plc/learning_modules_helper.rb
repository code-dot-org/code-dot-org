module Plc::LearningModulesHelper
  def options_for_plc_task_learning_modules
    Plc::LearningModule.all.pluck(:name, :id).sort
  end

  def options_with_learning_module_names_and_required_tag(course_unit)
    course_unit.plc_learning_modules.order(:required, :name).map do |learning_module|
      [learning_module.get_name_with_required_tag, learning_module.id]
    end
  end

  def learning_modules_select_size options
    [options.size, 25].min
  end
end
