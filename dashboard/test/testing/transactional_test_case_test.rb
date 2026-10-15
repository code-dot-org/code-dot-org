require 'test_helper'
require 'securerandom'

class ActiveSupport::Testing::TransactionalTestCaseTest < ActiveSupport::TestCase
  UNIT_NAMES = Array.new(10) {Faker::Lorem.unique.word.downcase}

  setup_all do
    # Verifies that exactly one database transaction is open on the current connection during setup_all,
    # indicating no nested transactions or savepoints.
    assert_equal 1, ActiveRecord::Base.connection.open_transactions

    @units = UNIT_NAMES.map {|unit_name| create(:unit, name: unit_name)}
  end

  Minitest.after_run do
    raise Minitest::Assertion, 'DB transaction is still opened' if ActiveRecord::Base.connection.transaction_open?
    raise Minitest::Assertion, 'DB records were not rolled back and still exist' if Unit.exists?(name: UNIT_NAMES)
  end

  shared_examples_for 'shares root class context' do |transaction_count:|
    # Verifies that each example runs inside its own database transaction,
    # in addition to the class level transaction opened by parent `setup_all` callbacks.
    it 'has expected number of opened transactions per test' do
      assert_equal transaction_count, ActiveRecord::Base.connection.open_transactions
    end

    # Ensures instance variables created in the parent `setup_all` are accessible within this class tests.
    it '@units are accessible' do
      assert @units.all?(Unit)
    end

    # Ensures each Unit created in the parent `setup_all` exists in the database during this class tests.
    UNIT_NAMES.each do |unit_name|
      it "unit #{unit_name} exists" do
        refute_nil Unit.find_by(name: unit_name)
      end
    end
  end

  it_behaves_like 'shares root class context', transaction_count: 2

  # Minitest::Spec `describe` and `context` blocks are not isolated and share the parent test class context.
  describe 'describe block' do
    it_behaves_like 'shares root class context', transaction_count: 2

    context 'context block' do
      it_behaves_like 'shares root class context', transaction_count: 2
    end
  end

  # Minitest::Spec `describe` and `context` blocks are not isolated and share the parent test class context.
  describe 'describe block with own setup_all' do
    setup_all do
      # Verifies that this block runs inside its own transaction
      # in addition to the root class transaction, resulting in two open transactions.
      assert_equal 2, ActiveRecord::Base.connection.open_transactions
    end

    it_behaves_like 'shares root class context', transaction_count: 3

    context 'context block' do
      it_behaves_like 'shares root class context', transaction_count: 3
    end
  end

  describe 'test case with stale connection' do
    UNIT_NAME = "stale-connection-test-unit-#{SecureRandom.hex(8)}".freeze

    # Simulates a connection object that was current while a test class was loaded,
    # but is no longer the connection used by ActiveRecord when setup_all runs.
    class StaleConnection
      def begin_transaction(*)
        @transaction_open = true
      end

      def rollback_transaction
        @transaction_open = false
      end
    end

    subject(:isolated_test_case_with_stale_connection) do
      ActiveRecord::Base.stubs(:connection).returns(StaleConnection.new)

      Class.new(ActiveSupport::TestCase) do
        runnables.delete self

        setup_all do
          create(:unit, name: UNIT_NAME)
        end

        it 'sees setup_all record inside isolated test case stale transaction' do
          _(Unit).must_be :exists?, name: UNIT_NAME
        end
      end
    ensure
      ActiveRecord::Base.unstub(:connection)
    end

    around do |test|
      test.call
    ensure
      Unit.find_by(name: UNIT_NAME)&.destroy
    end

    it 'rolls back setup_all records' do
      reporter = Minitest::StatisticsReporter.new
      isolated_test_case_with_stale_connection.run reporter
      raise reporter.results.first.failure unless reporter.passed?

      _(Unit).wont_be :exists?, name: UNIT_NAME
    end
  end

  class IsolationTest < ActiveSupport::TestCase
    setup_all do
      # Asserts that setup_all runs inside exactly one database transaction on the current connection,
      # with no nested transactions or savepoints inherited from the parent test class.
      assert_equal 1, ActiveRecord::Base.connection.open_transactions
    end

    # Verifies that each test runs inside its own database transaction,
    # in addition to the class level transaction opened by `setup_all`.
    test 'has expected number of opened transactions per test' do
      assert_equal 2, ActiveRecord::Base.connection.open_transactions
    end

    # Ensures that Units created in the parent class `setup_all`
    # do not exist in the database for this isolated test class.
    UNIT_NAMES.each do |unit_name|
      test "unit #{unit_name} missing" do
        assert_nil Unit.find_by(name: unit_name)
      end
    end
  end
end
