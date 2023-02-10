module CustomCops
  class ConsistentQuotationMark < RuboCop::Cop::Base
    def_node_matcher :argument_name, <<~PATTERN
      (send nil? :argument (:sym $_) ...)
    PATTERN

    # rubocop:disable CustomCops/ConsistentQuotationMark
    NOT_ALLOWED_CHARACTERS = [
      '“', # U+201C Left Double Quotation Mark
      '”', # U+201D Right Double Quotation Mark
      '‘', # U+2018 Left Single Quotation Mark
      '’', # U+2019 Right Single Quotation Mark
    ].freeze
    # rubocop:enable CustomCops/ConsistentQuotationMark

    NOT_ALLOWED_REGEX = /[#{NOT_ALLOWED_CHARACTERS.join}]/

    MSG = "Do not use left/right quotation mark – use \' or \" instead.".freeze

    def on_str(node)
      string = node.source
      return unless string.match?(NOT_ALLOWED_REGEX)

      add_offense(node)
    end
  end
end
