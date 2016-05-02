module Plc::LearningModulesHelper
  def options_for_plc_task_learning_modules
    Plc::LearningModule.all.pluck(:name, :id).sort
  end

  def options_with_learning_module_names_and_required_tag(course_unit)
    course_unit.plc_learning_modules.order(:module_type, :name).map do |learning_module|
      [learning_module.name_with_required_tag, learning_module.id]
    end
  end

  def learning_modules_for_task_multi_select(f, options, selected)
    f.select :plc_learning_module_ids, options_for_select(options, selected.try(:pluck, :id)), {}, {multiple: true, size: [options.size, 25].min, style: 'width: 100%'}
  end

  def options_for_learning_module_types
    Plc::LearningModule::MODULE_TYPES.map do |module_type|
      [module_type.titleize, module_type]
    end
  end
end
