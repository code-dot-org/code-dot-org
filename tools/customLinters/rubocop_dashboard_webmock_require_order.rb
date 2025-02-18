module CustomCops
  # Custom cop that checks that the webmock must only happen after requiring test_helper
  # test_helper can include web requests, so if mocking out all web requests, it should be done only after
  # test_helper has been initialized.
  class WebmockStubRequireOrder < RuboCop::Cop::Base
    extend RuboCop::Cop::AutoCorrector
    MSG = 'test_helper must be before webmock'

    def_node_matcher :require_statement?, <<~PATTERN
      {
        (send nil? :require (str $_))
      }
    PATTERN

    def on_send(node)
      return unless require_statement?(node) do |package|
        if (package == 'test_helper') && @webmock_require.present?
          add_offense(node, message: MSG) do |corrector|
            corrector.insert_before(@webmock_require, "#{node.source}\n")
            corrector.remove(node)
          end
        end

        if package == 'webmock/minitest'
          @webmock_require = node
        end
      end
    end
  end
end
