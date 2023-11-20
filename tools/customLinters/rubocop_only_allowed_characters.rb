require_relative 'linter_constants'

module CustomCops
  class OnlyAllowedCharacters < RuboCop::Cop::Base
    include LinterConstants

    MSG = NOT_ALLOWED_MSG

    def on_str(node)
      string = node.source
      return unless string.match?(NOT_ALLOWED_REGEX)

      add_offense(node)
    end
  end
end
