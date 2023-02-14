require_relative 'linter_constants'

module CustomCops
  class ConsistentQuotationMark < RuboCop::Cop::Base
    MSG = "Do not use left/right quotation mark – use \' or \" instead.".freeze

    def on_str(node)
      string = node.source
      return unless string.match?(LinterConstants::NOT_ALLOWED_REGEX)

      add_offense(node)
    end
  end
end
