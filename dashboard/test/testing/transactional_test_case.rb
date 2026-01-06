require_relative 'setup_all_and_teardown_all'

module ActiveSupport
  module Testing
    # Wraps the entire test case in a transaction.
    module TransactionalTestCase
      extend ActiveSupport::Concern

      include ActiveSupport::Testing::SetupAllAndTeardownAll

      included do
        class_attribute :db_connection, default: nil

        # Runs each test inside a database transaction that is rolled back after the test.
        # @note Enabled by default, but set explicitly to make this behavior clear and ensure it stays enabled.
        # @see https://github.com/rails/rails/blob/v6.1.7.7/activerecord/lib/active_record/test_fixtures.rb
        self.use_transactional_tests = true

        # Skips per-test fixture loading to reduce database setup overhead.
        # @note Fixtures are already loaded during test database seeding.
        self.pre_loaded_fixtures = true
      end

      class_methods do
        # Ensures any database changes made in setup_all are rolled back after all tests in the class.
        private def setup_all(*args, &block)
          self.db_connection = ActiveRecord::Base.connection

          super(*args) do
            db_connection.begin_transaction(joinable: false)
            instance_exec(&block) if block
          end

          teardown_all do
            db_connection.rollback_transaction
          end
        end
      end
    end
  end
end
