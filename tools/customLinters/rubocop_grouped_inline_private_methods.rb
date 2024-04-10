module CustomCops
  # Based on https://github.com/rubocop/rubocop/blob/v1.52.1/lib/rubocop/cop/style/access_modifier_declarations.rb
  class InlinePlusGroupedAccessModifierDeclarations < RuboCop::Cop::Base
    RESTRICT_ON_SEND = %i[private].freeze
    MESSAGE = 'inlined private methods should all be grouped together at the end of the file.'.freeze

    # @!method access_modifier_with_symbol?(node)
    def_node_matcher :access_modifier_with_symbol?, <<~PATTERN
      (send nil? {:private} (sym _))
    PATTERN

    def on_send(node)
      return unless node.access_modifier?
      add_offense(node.loc.selector, message: MESSAGE) unless right_sibling_same_inline_method?(node)
    end

    private def right_sibling_same_inline_method?(node)
      return true if node.right_siblings.empty?
      sibling = node.right_siblings.first
      return sibling.send_type? && sibling.method?(node.method_name) && !sibling.arguments.empty?
    end
  end
end
