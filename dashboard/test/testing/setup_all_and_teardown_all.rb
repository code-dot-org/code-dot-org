require "active_support/callbacks"

module ActiveSupport
  module Testing
    # Add support for +setup_all+ and +teardown_all+ callbacks.
    # These callbacks serve as an extension to the existing <tt>#setup</tt> and
    # <tt>#teardown</tt> methods, and allow you to define callbacks which
    # happen just once before and after the individual tests run.
    #
    #   class ExampleTest < ActiveSupport::TestCase
    #     setup_all do
    #       # ...
    #     end
    #
    #     teardown_all do
    #       # ...
    #     end
    #   end
    module SetupAllAndTeardownAll
      def self.prepended(klass)
        klass.include ActiveSupport::Callbacks
        klass.define_callbacks :setup_all, :teardown_all
        klass.extend ClassMethods
      end

      module ClassMethods
        def run(reporter, options = {})
          run_callbacks :setup_all
          super(reporter, options)
          run_callbacks :teardown_all
        end

        # Add a callback, which runs once before any individual test is run
        def setup_all(*args, &block)
          set_callback(:setup_all, :before, *args, &block)
        end

        # Add a callback, which runs once after all individual tests are run
        def teardown_all(*args, &block)
          set_callback(:teardown_all, :after, *args, &block)
        end
      end
    end
  end
end
