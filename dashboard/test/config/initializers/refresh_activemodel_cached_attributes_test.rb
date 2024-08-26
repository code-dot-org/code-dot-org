require 'test_helper'

class TestModel
  include ActiveModel::Model
  attr_accessor :foo

  # See https://github.com/rails/rails/blob/v6.1.7.7/activemodel/lib/active_model/attributes.rb#L15
  def self.reset_column_information
    self._default_attributes = ActiveModel::AttributeSet.new({})
  end
end

class RefreshActiveModelCachedAttributesTest < ActiveSupport::TestCase
  def setup
    @mock_migration_context = mock
    @mock_migration_context.stubs(:get_all_versions).returns([1, 2, 3])
    ApplicationRecord.connection.stubs(:migration_context).returns(@mock_migration_context)
    TestModel.new.send(:count_and_remember_database_migrations)
  end

  def teardown
    ApplicationRecord.connection.unstub(:migration_context)
  end

  test 'count_and_remember_database_migrations' do
    # Initial value determined by the state of the database at initialization time
    assert_equal 3, TestModel.class_variable_get(:@@latest_count_of_database_migrations)

    # New migrations won't immediately update the saved count
    @mock_migration_context.stubs(:get_all_versions).returns([1, 2, 3, 4])
    assert_equal 3, TestModel.class_variable_get(:@@latest_count_of_database_migrations)

    # Invoking the "count and remember" method will
    TestModel.new.send(:count_and_remember_database_migrations)
    assert_equal 4, TestModel.class_variable_get(:@@latest_count_of_database_migrations)
  end

  test 'new_database_migration_since_initialization' do
    # Should be false just after initialization
    u = TestModel.new
    refute u.send(:new_database_migration_since_initialization?)
    refute TestModel.new.send(:new_database_migration_since_initialization?)

    # Adding a new migration to the set of migrations that have been executed
    # on this database should result in a positive detection.
    @mock_migration_context.stubs(:get_all_versions).returns([1, 2, 3, 4])
    assert u.send(:new_database_migration_since_initialization?)
    assert TestModel.new.send(:new_database_migration_since_initialization?)

    # Note that changing the specific versions returned without changing the
    # total count of versions will result in a false negative. This probably
    # isn't an desirable outcome, but we don't expect migrations to ever vanish
    # from this set so shouldn't in practice ever be an issue.
    @mock_migration_context.stubs(:get_all_versions).returns([9, 8, 7])
    refute u.send(:new_database_migration_since_initialization?)
    refute TestModel.new.send(:new_database_migration_since_initialization?)
  end
end
