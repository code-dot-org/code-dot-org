module CustomCops
  # Based on https://github.com/rubocop/rubocop/blob/v1.52.1/lib/rubocop/cop/style/access_modifier_declarations.rb
  class InlinePlusGroupedAccessModifierDeclarations < RuboCop::Cop::Base
    RESTRICT_ON_SEND = %i[private private_class_method].freeze
    MESSAGE = 'inlined private methods should all be grouped together at the end of the code block.'.freeze

    # @!method access_modifier_with_symbol?(node)
    def_node_matcher :access_modifier_with_symbol?, <<~PATTERN
      (send nil? {#{RESTRICT_ON_SEND.map(&:inspect).join(' ')}} (sym _))
    PATTERN

    def on_send(node)
      return unless node.access_modifier?
      return if node.right_siblings.empty?
      return if node_is_private?(node.right_siblings.first)
      add_offense(node.loc.selector, message: MESSAGE)
    end

    private def node_is_private?(node)
      return node.send_type? && RESTRICT_ON_SEND.include?(node.method_name) && !node.arguments.empty?
    end
  end
end
