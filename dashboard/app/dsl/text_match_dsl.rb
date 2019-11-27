# Collects an open-ended response through a text field.
# Success only if the text field input exactly matches one of the provided answers.
# If there are no provided answers, any input will match.
class TextMatchDSL < ContentDSL
  def initialize
    @hash = {answers: []}
  end

  def height(text) @hash[:height] = text end
  def answer(text) @hash[:answers] << text end
  def placeholder(text) @hash[:placeholder] = text end

  def self.non_i18n_fieldnames
    super + %w(height)
  end
end
