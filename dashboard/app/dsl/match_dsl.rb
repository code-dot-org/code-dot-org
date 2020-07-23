class MatchDSL < ContentDSL
  def initialize
    super
    @hash.merge! questions: [], answers: []
  end

  def height(text) @hash[:height] = text end

  def question(text) @hash[:questions] << {text: text} end

  def answer(text, correct=nil, feedback=nil)
    answer = {text: text}
    answer[:correct] = correct unless correct.nil?
    answer[:feedback] = feedback unless feedback.nil?
    @hash[:answers] << answer
  end

  def layout(text) @hash[:layout] = text end

  # @override
  def self.i18n_fields
    super + %w(
      answers
      feedback
      questions
    )
  end
end
