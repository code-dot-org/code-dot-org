class EvaluationMultiDSL < MultiDSL
  def answer(text, weight: weight = 1, stage_name: stage_name = nil)
    answer = {text: text}
    raise 'Weight must be an integer' unless weight.is_a?(Integer)
    answer[:weight] = weight || 1
    raise "Unknown stage #{stage_name}" unless stage_name.nil? || Stage.exists?(name: stage_name)
    answer[:stage] = Stage.find_by(name: stage_name)
    @hash[:answers] << answer
  end
end
