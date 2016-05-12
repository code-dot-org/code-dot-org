class EvaluationQuestionDSL < MultiDSL
  def answer(text, weight = 1, learning_module = nil)
    answer = {text: text}
    answer[:weight] = weight || 1
    raise 'Weight must be an integer' unless answer[:weight].is_a?(Integer)
    answer[:learning_module] = learning_module
    raise "Unknown learning module #{learning_module}" unless learning_module.nil? || Plc::LearningModule.exists?(name: learning_module)
    @hash[:answers] << answer
  end
end
