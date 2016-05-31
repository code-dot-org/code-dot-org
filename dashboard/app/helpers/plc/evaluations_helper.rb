module Plc::EvaluationsHelper
  def determine_preferred_learning_modules level_source, script
    return [] if level_source.nil?

    responses = JSON.parse(level_source.data)
    learning_module_weights = Hash.new(0)

    responses.each do |level_id, response|
      level = EvaluationMulti.find(level_id)
      selected_answer = level.answers[response['result'].to_i]

      next if selected_answer['stage'].nil?

      stage = Stage.find_by(name: selected_answer['stage']['name'], script_id: script.id)
      learning_module = stage.try(:plc_learning_module)

      next if learning_module.nil?

      learning_module_weights[learning_module] += selected_answer['weight']
    end

    learning_module_weights = learning_module_weights.sort_by{|_, weight| weight}

    default_module_assignments = []

    Plc::LearningModule::NONREQUIRED_MODULE_TYPES.each do |module_type|
      module_to_assign = learning_module_weights.find {|learning_module| learning_module[0].module_type == module_type}.try(:[], 0)
      next if module_to_assign.nil?
      default_module_assignments << module_to_assign.id
    end

    default_module_assignments
  end
end
