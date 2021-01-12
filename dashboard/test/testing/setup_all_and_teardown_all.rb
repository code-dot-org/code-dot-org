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
          @reporter = reporter
          @instance = run_callbacks :setup_all
          # @time is set by `time_it`, and needs to be removed before the instance is reused.
          @instance.remove_instance_variable :@time
          super(reporter, options)
          run_callbacks :teardown_all
        end

        # Return a singleton instance for running individual tests,
        # so instance variables can be duplicated across all tests and callbacks.
        def new(name)
          @instance ||= super
          instance = @instance.dup
          instance.name = name
          instance.failures = []
          instance
        end

        private

        def run_callbacks(name)
          instance = new(name.to_s)
          instance.time_it do
            instance.capture_exceptions do
              instance.run_callbacks(name)
            end
          end
          @reporter.record instance if instance.failure
          instance
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
