module CustomCops
  class InlinePlusGroupedAccessModifierDeclarations < RuboCop::Cop::Style::AccessModifierDeclarations
    MESSAGE = '`%<access_modifier>s` methods should all be grouped together.'.freeze

    def offense?(node)
      inline = access_modifier_is_inlined?(node)
      group = !right_sibling_same_inline_method?(node)
      return inline && group
    end

    def autocorrect(corrector, node)
      def_node = find_corresponding_def_node(node)
      return unless def_node

      replace_def(corrector, node, def_node)
    end

    def opposite_style_detected
      # disable styles
    end

    def correct_style_detected
      # disable styles
    end

    def right_sibling_same_inline_method?(node)
      return true if node.right_siblings.empty?
      sibling = node.right_siblings.first
      return sibling.send_type? && sibling.method?(node.method_name) && !sibling.arguments.empty?
    end

    def message(range)
      access_modifier = range.source
      format(MESSAGE, access_modifier: access_modifier)
    end

    def group_style?
      true
    end

    def inline_style?
      true
    end
  end
end
