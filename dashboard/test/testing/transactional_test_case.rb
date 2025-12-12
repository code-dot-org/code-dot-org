# Submitted upstream at https://github.com/rails/rails/pull/28178
require "active_support/concern"
require "active_support/callbacks"

require 'database_cleaner/active_record'
require 'testing/setup_all_and_teardown_all'

module ActiveSupport
  module Testing
    # Wraps the entire test case in a transaction.
    module TransactionalTestCase
      extend ActiveSupport::Concern

      include ActiveSupport::Testing::SetupAllAndTeardownAll

      included do
        class_attribute :use_transactional_test_case, instance_writer: false, default: false

        DatabaseCleaner.strategy = :transaction

        setup_all do
          DatabaseCleaner.start if use_transactional_test_case?
        end

        teardown_all do
          DatabaseCleaner.clean if use_transactional_test_case?
        end

        def before_setup
          DatabaseCleaner.start
          super
        end

        def after_teardown
          super
          DatabaseCleaner.clean
        end
      end
    end
  end
end
