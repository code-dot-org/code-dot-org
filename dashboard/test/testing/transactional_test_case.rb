# Submitted upstream at https://github.com/rails/rails/pull/28178
require "active_support/concern"
require "active_support/callbacks"

require 'testing/setup_all_and_teardown_all'

module ActiveSupport
  module Testing
    # Wraps the entire test case in a transaction.
    module TransactionalTestCase
      extend ActiveSupport::Concern

      include ActiveSupport::Testing::SetupAllAndTeardownAll

      included do
        class_attribute :use_transactional_test_case, instance_writer: false, default: false

        setup_all do
          begin_transaction if use_transactional_test_case?
        end

        teardown_all do
          rollback_transaction if use_transactional_test_case?
        end
      end

      def before_setup
        begin_transaction
        super
      end

      def after_teardown
        super
        rollback_transaction
      end

      # @see https://github.com/DatabaseCleaner/database_cleaner-active_record/blob/v2.1.0/lib/database_cleaner/active_record/transaction.rb#L6-L11
      private def begin_transaction
        # Hack to make sure that the connection is properly set up before cleaning
        ActiveRecord::Base.connection.transaction {}

        ActiveRecord::Base.connection.begin_transaction(joinable: false)
      end

      # @see https://github.com/DatabaseCleaner/database_cleaner-active_record/blob/v2.1.0/lib/database_cleaner/active_record/transaction.rb#L14-L19
      private def rollback_transaction
        ActiveRecord::Base.connection_pool.connections.each do |connection|
          connection.rollback_transaction if connection.open_transactions > 0
        end
      end
    end
  end
end
