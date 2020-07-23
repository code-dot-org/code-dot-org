# Collects a contract specified through an input UI.
# Success only if the contract exactly matches one of the provided answers.
class ContractMatchDSL < ContentDSL
  def initialize
    @hash = {answers: []}
  end

  def answer(text) @hash[:answers] << text end

  # @override
  def self.i18n_fields
    super + %w(answers)
  end
end
