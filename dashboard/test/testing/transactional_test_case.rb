# Submitted upstream at https://github.com/rails/rails/pull/28178
require "active_support/concern"
require "active_support/callbacks"

module ActiveSupport
  module Testing
    # Wraps the entire test case in a transaction.
    module TransactionalTestCase
      extend ActiveSupport::Concern

      included do
        class_attribute :use_transactional_test_case
        self.use_transactional_test_case = false

        setup do
          pools = ActiveRecord::Base.connection_handler.connection_pool_list
          all_connections = pools.map(&:connections).flatten
          if all_connections.many?
            warning = 'WARN: Multiple ActiveRecord connections are in use, this can make transactional tests fail in weird ways.'
            CDO.log.warn warning
            puts warning
          end
        end

        setup_all do
          # Global fixture-setup happens once, and must persist outside any transaction.
          setup_fixtures
          if use_transactional_test_case?
            @test_case_connections = enlist_transaction_connections
            @test_case_connections.each do |connection|
              connection.begin_transaction joinable: false, _lazy: false, lock_thread: true
              connection.pool.lock_thread = true
            end
          end
        end

        teardown_all do
          if use_transactional_test_case && @test_case_connections
            @test_case_connections.each do |connection|
              connection.rollback_transaction if connection.transaction_open?
              connection.pool.lock_thread = false
            end
          end
        end

        private

        # Only select connections that support savepoints,
        # because individual test transactions will be nested
        # within the outer test case transaction.
        def enlist_transaction_connections
          ActiveRecord::Base.connection_handler.connection_pool_list.
            map(&:connection).
            select(&:supports_savepoints?)
        end
      end
    end
  end
end
