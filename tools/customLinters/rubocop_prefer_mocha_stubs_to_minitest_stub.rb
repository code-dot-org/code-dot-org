module CustomCops
  # Both Minitest's `stub` method and Mocha's `stubs` method are available for
  # use in our Ruby test environment, but we recommend the use of Mocha over
  # Minitest when possible. This Cop attempts to enforce that recommendation by
  # identifying uses of the Minitest-added method `stub` and instead
  # recommending the developer use the Mocha-added method `stubs`:
  #
  # https://www.rubydoc.info/gems/minitest/5.15.0/Object#stub-instance_method
  # https://www.rubydoc.info/gems/mocha/1.1.0/Mocha/ObjectMethods#stubs-instance_method
  #
  # Mocha's stubbing functionality is simpler but therefore easier to follow,
  # which should hopefully help keeps tests similarly readable. Minitest's
  # additional complexity may be occasionally necessary for specific use cases,
  # in which case this Cop can be disabled with a rubocop:disable directive.
  class PreferMochaStubsToMinitestStub < RuboCop::Cop::Base
    MSG = "Looks like you're trying to stub with Minitest; we recommend using Mocha instead: https://www.rubydoc.info/gems/mocha/1.1.0/Mocha/ObjectMethods#stubs-instance_method"

    # Look for invocations of the Minitest-added method `Object#stub()`.
    #
    # https://www.rubydoc.info/gems/minitest/5.15.0/Object#stub-instance_method
    RESTRICT_ON_SEND = [:stub].freeze

    # Ignore invocations of the Mocha-added standalone method `stub()`, which
    # can be distinguished from Minitest's by its lack of a parent element.
    #
    # https://www.rubydoc.info/gems/mocha/1.1.0/Mocha/API#stub-instance_method
    def_node_matcher :stub_call_has_parent?, '(send !nil? :stub ...)'

    def on_send(node)
      return unless stub_call_has_parent?(node)
      add_offense(node, message: MSG, severity: :warning)
    end
  end
end
