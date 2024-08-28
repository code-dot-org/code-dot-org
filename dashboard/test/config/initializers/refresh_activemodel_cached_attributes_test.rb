require 'test_helper'

class TestModel
  include ActiveModel::Model
  include ActiveModel::Attributes
  attr_accessor :foo
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

  test 'assign_attributes will update cached information rather than raising an error when possible' do
    class TestUpdatableModel < TestModel
      # To simulate the effects of resetting column information on a
      # database-backed model (ie, an ActiveRecord object) when the underlying
      # database has updated columns, define a custom
      # `reset_column_information` method which will manually update column
      # information to the new state, rather than just clearing the cache.
      def self.reset_column_information
        # _default_attributes is a class_attribute, so `self` is required
        # rubocop:disable Style/RedundantSelf
        self._default_attributes = ActiveModel::AttributeSet.new({})
        self._default_attributes['bar'] = ActiveModel::Attribute.from_database('bar', nil, ActiveModel::Type::String.new)
        # rubocop:enable Style/RedundantSelf
      end
    end

    # Regular initialization works as expected
    TestUpdatableModel.new(foo: 'bar')

    # Initialization with a field that does not exist will raise an error if
    # the underlying database has not yet been updated.
    assert_raises ActiveModel::UnknownAttributeError do
      TestUpdatableModel.new(bar: 'baz')
    end

    # If the underlying database is updated such that the field does exist,
    # initialization will now work.
    @mock_migration_context.stubs(:get_all_versions).returns([1, 2, 3, 4])
    TestUpdatableModel.new(bar: 'baz')
  end
end
