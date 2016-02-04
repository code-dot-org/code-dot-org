module LearningModulesHelper
  def options_for_artifact_learning_module
    options = []

    LearningModule.all.each do |learning_module|
      options << [learning_module.name, learning_module.id]
    end

    options
  end
end