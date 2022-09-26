class EvaluationMultiDSL < MultiDSL
  def answer(text, weight: 1, lesson_name: nil)
    raise 'Weight must be an integer' unless weight.is_a?(Integer)
    answer = {
      text: text,
      weight: weight || 1,
      lesson: lesson_name
    }
    @hash[:answers] << answer
  end

  # @override
  def i18n_hash
    final_hash = super
    final_hash['answers']&.each {|answer| answer.delete 'weight'}
    final_hash
  end
end
