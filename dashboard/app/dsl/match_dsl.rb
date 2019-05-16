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

  def i18n_strings
    strings = super[@name]
    strings['questions'] = @hash[:questions].map do |question|
      question[:text]
    end.compact
    strings['answers'] = @hash[:answers].map do |answer|
      answer[:text]
    end.compact
    strings['feedbacks'] = @hash[:answers].map do |answer|
      answer[:feedback]
    end.compact
    strings.delete_if {|_, v| v.empty?}
    {@name => strings}
  end
end
