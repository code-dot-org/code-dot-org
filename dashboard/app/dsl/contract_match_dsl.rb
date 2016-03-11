# Collects a contract specified through an input UI.
# Success only if the contract exactly matches one of the provided answers.
class ContractMatchDSL < ContentDSL
  def initialize
    @hash = { answers: [] }
  end

  def answer(text) @hash[:answers] << text end

  def i18n_strings
    strings = super [@name]

    @hash[:answers].each do |answer|
      strings[answer] = answer
    end

    {@name => strings}
  end

end
