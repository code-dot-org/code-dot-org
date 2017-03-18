require 'rails/test_help'
require 'testing/setup_all_and_teardown_all'
require 'testing/transactional_test_case'

class SetupAllAndTeardownAllTest < ActiveSupport::TestCase
  include ActiveSupport::Testing::SetupAllAndTeardownAll
  self.test_order = :sorted

  setup_all :reset_callback_record, :foo
  setup :bar, :baz
  teardown :quux, :qux
  teardown_all :sentinel, :garply

  def test_setup_all
    assert_equal %w(foo bar baz), @called_back
  end

  def test_setup_all_2
    assert_equal %w(foo bar baz qux quux bar baz), @called_back
  end

  private

  %w(foo bar baz qux quux garply).each do |method|
    define_method(method) do
      @called_back << method
    end
  end

  def reset_callback_record
    @called_back = []
  end

  def sentinel
    assert_equal %w(foo bar baz qux quux bar baz qux quux garply), @called_back
  end
end

class TransactionTest < ActiveSupport::TestCase
  cattr_accessor :count
  # Run three internal TestCases in a fixed secuence.
  class TransactionalTestCasePreTest < ActiveSupport::TestCase
    # Remove this TestCase from the global test runner.
    runnables.delete self

    include ActiveSupport::Testing::SetupAllAndTeardownAll
    fixtures :callout

    def test_create_fixture
      TransactionTest.count = Callout.count
    end
  end

  class TransactionalTestCaseTest < ActiveSupport::TestCase
    runnables.delete self

    include ActiveSupport::Testing::SetupAllAndTeardownAll
    include ActiveSupport::Testing::TransactionalTestCase

    self.use_transactional_test_case = true

    fixtures :callout

    def test_fixture_created
      assert_equal TransactionTest.count, Callout.count
      Callout.last.destroy
    end
  end

  class TransactionalTestCasePostTest < ActiveSupport::TestCase
    runnables.delete self

    def test_fixture_rolled_back
      assert_equal TransactionTest.count, Callout.count
    end
  end

  def test_run_tests
    reporter = Minitest::StatisticsReporter.new
    reporter.start
    TransactionalTestCasePreTest.run reporter
    TransactionalTestCaseTest.run reporter
    TransactionalTestCasePostTest.run reporter
    unless reporter.passed?
      raise reporter.results.first.failure
    end
  end
end
