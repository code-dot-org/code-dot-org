# Collects a contract specified through an input UI.
# Success only if the contract exactly matches one of the provided answers.
class ContractMatchDSL < ContentDSL
  def initialize
    @hash = {answers: []}
  end

  def answer(text) @hash[:answers] << text end

  def i18n_strings
    strings = super
    strings['answers'] = @hash[:answers] unless @hash[:answers].empty?

    strings.deep_stringify_keys
  end
end
