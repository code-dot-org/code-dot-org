module ProfessionalLearningModulesHelper
  def options_for_professional_learning_task_learning_module
    options = []

    ProfessionalLearningModule.all.each do |learning_module|
      options << [learning_module.name, learning_module.id]
    end

    options
  end
end
