# Collects an open-ended response through a text field.
# Success only if the text field input exactly matches one of the provided answers.
class TextMatchDSL < ContentDSL
  def initialize
    @hash = { answers: [] }
  end

  def answer(text) @hash[:answers] << text end

  def i18n_strings
    strings = super[@name]

    @hash[:answers].each do |answer|
      strings[answer] = answer
    end

    {@name => strings}
  end

end
