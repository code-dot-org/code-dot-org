class MatchDSL < ContentDSL
  def initialize
    super
    @hash.merge! questions: [], answers: []
  end

  def height(text) @hash[:height] = text end
  def question(text) @hash[:questions] << { text: text } end

  def answer(text, correct=nil)
    answer = {text: text}
    answer[:correct] = correct unless correct.nil?
    @hash[:answers] << answer
  end

  def i18n_strings
    strings = super [@name]
    @hash[:questions].each do |question|
      text = question[:text]
      strings[text] = text
    end
    @hash[:answers].each do |answer|
      text = answer[:text]
      strings[text] = text
    end
    {@name => strings}
  end

end
