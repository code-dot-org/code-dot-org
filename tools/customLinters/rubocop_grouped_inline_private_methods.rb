module CustomCops
  # Rudimentary implementations of a custom Rubocop rule that enforces all
  # inlined private methods should be grouped together at the end of the code
  # block.
  #
  # Intended to be used alongside `Style/AccessModifierDeclarations` with
  # `EnforcedStyle: inline`; the goal is to benefit from the explicit
  # declarations of the `inline` style while still enforcing the separation of
  # interface methods and implementation details as the `group` style.
  #
  # Also allows for the use of the `private_class_method` helper.
  #
  # Note: one of the reasons we place value on the explicit inline declarations
  # is that many of our class definitions are much larger than recommended, to
  # the extent that it can be more difficult than intended to notice a single
  # `private` declaration buried amongst several hundred lines of code. If we
  # are over time able to slim down our class definitions, it should be
  # possible for us to reduce the disadvantage of the `group` style enough that
  # we can simply switch to that and abandon this custom rule.
  #
  # @example
  #   # bad
  #   class Foo
  #     private def baz; end
  #     def bar; end
  #     private def bat; end
  #   end
  #
  #   # good
  #   class Foo
  #     def bar; end
  #     private def baz; end
  #     private def bat; end
  #   end
  class GroupedInlinePrivateMethods < RuboCop::Cop::Base
    RESTRICT_ON_SEND = %i[private private_class_method].freeze
    MESSAGE = 'inlined private methods should all be grouped together at the end of the code block.'.freeze

    # Only match inlined declarations of private methods.
    def_node_matcher :inlined_private_method?, <<~PATTERN
      (send nil? {#{RESTRICT_ON_SEND.map(&:inspect).join(' ')}} (sym _))
    PATTERN

    # Check an inlined declaration to see if it violates the rule;
    # specifically, that if a private declaration is followed by another
    # sibling, that sibling is also a private declaration.
    def on_send(node)
      return if node.right_siblings.empty? ||
        node_is_private?(node.right_siblings.first)

      add_offense(node.loc.selector, message: MESSAGE)
    end

    # Return true if the given node represents an inline private declaration.
    private def node_is_private?(node)
      return node.send_type? &&
          RESTRICT_ON_SEND.include?(node.method_name) &&
          !node.arguments.empty?
    end
  end
end
