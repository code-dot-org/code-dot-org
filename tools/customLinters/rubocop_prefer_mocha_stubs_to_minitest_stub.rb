module CustomCops
  class PreferMochaStubsToMinitestStub < RuboCop::Cop::Base
    MSG = "Looks like you're trying to stub with Minitest; we recommend using Mocha instead."

    # Look for invocations of the Minitest-added method `Object#stub()`:
    # https://www.rubydoc.info/gems/minitest/5.15.0/Object#stub-instance_method
    RESTRICT_ON_SEND = [:stub].freeze

    # Ignore invocations of the Mocha-added standalone method `stub()`
    # https://www.rubydoc.info/gems/mocha/1.1.0/Mocha/API#stub-instance_method
    def_node_matcher :stub_call_has_parent?, '(send !nil? :stub ...)'

    def on_send(node)
      return unless stub_call_has_parent?(node)
      add_offense(node, message: MSG, severity: :warning)
    end
  end
end
