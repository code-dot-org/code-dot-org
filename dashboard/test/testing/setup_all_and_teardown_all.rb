# Submitted upstream at https://github.com/rails/rails/pull/28178
require "active_support/concern"
require "active_support/callbacks"

module ActiveSupport
  module Testing
    # Add support for +setup_all+ and +teardown_all+ callbacks.
    module SetupAllAndTeardownAll
      extend ActiveSupport::Concern

      included do
        include ActiveSupport::Callbacks

        # It's not 100% clear why this is necessary, but here's what we do know:
        #
        # Between Rails 5.0 and 5.2, the implementation of ActiveSupport callbacks was refactored to
        # improve the backtrace experience (https://github.com/rails/rails/pull/26147). This
        # refactoring made some changes to the way the callbacks are stored on the class, and this
        # change seems to have resulted in our extension not being correctly applied to descendant
        # classes. Specifically, we found ourselves in a situation where these callbacks were
        # defined correctly on the ActiveSupport:TestCase class, but only on that class.
        #
        # Our naive solution is to explicitly define the callbacks on all descendant classes here at
        # inclusion time, rather than trying to rely on class inheritance as we did before.
        ([self] + ActiveSupport::DescendantsTracker.descendants(self)).reverse_each do |target|
          target.define_callbacks :setup_all, :teardown_all
        end
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

        def setup_all(*args, &block)
          set_callback(:setup_all, :before, *args, &block)
        end

        def teardown_all(*args, &block)
          set_callback(:teardown_all, :after, *args, &block)
        end
      end
    end
  end
end
