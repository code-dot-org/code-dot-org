require 'pry'

module CustomCops
  class PreferMochaStubsToMinitestStub < RuboCop::Cop::Base
    MSG = "Looks like you're trying to stub with Minitest; we recommend using Mocha instead."
    RESTRICT_ON_SEND = [:stub].freeze

    def on_send(node)
      add_offense(node, message: MSG, severity: :warning)
    end
  end
end
