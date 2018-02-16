class EvaluationMultiDSL < MultiDSL
  def answer(text, weight: 1, stage_name: nil)
    raise 'Weight must be an integer' unless weight.is_a?(Integer)
    answer = {
      text: text,
      weight: weight || 1,
      stage: stage_name
    }
    @hash[:answers] << answer
  end
end
