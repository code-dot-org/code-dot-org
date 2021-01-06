# Submitted upstream at https://github.com/rails/rails/pull/28178
require "active_support/concern"
require "active_support/callbacks"

module ActiveSupport
  module Testing
    # Add support for +setup_all+ and +teardown_all+ callbacks.
    module SetupAllAndTeardownAll
      extend ActiveSupport::Concern

      module ClassMethods
        def setup_all(*args, &block)
          set_callback(:setup, :before, *args, &block)
        end

        def teardown_all(*args, &block)
          set_callback(:teardown, :after, *args, &block)
        end
      end
    end
  end
end
