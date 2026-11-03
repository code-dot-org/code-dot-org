require 'test_helper'

# A non-database-backed example of an ActiveModel Model which initially accepts
# an attribute `foo`, but which after resetting its internal cache of attribute
# values will accept an attribute `bar`. The intent is to simulate the effects
# of resetting column information on a database-backed Model (ie, an
# ActiveRecord object) when the underlying database has changed a column.
class UpdatableTestModel
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :foo, :string

  # Define a custom implementation of the ActiveRecord-provided
  # `reset_column_information` method which will manually update column
  # information to the new state, to emulate the effect of the underlying
  # database schema getting updated.
  def self.reset_column_information
    attribute :bar, :string

    reset_default_attributes
    _default_attributes['bar'] = ActiveModel::Attribute.from_database('bar', nil, ActiveModel::Type::String.new)
  end
end

class RefreshActiveModelCachedAttributesTest < ActiveSupport::TestCase
  def setup
    # Mock the results of querying the SchemaMigrations table, so we can
    # dynamically override the number of versions it returns to emulate the
    # effect of executing a migration.
    ActiveRecord::SchemaMigration.any_instance.stubs(:count).returns(3)

    # Force a recount before every test, since the other tests might have
    # changed something.
    UpdatableTestModel.new.send(:count_and_remember_database_migrations)
  end

  test 'count_and_remember_database_migrations' do
    # Initial value determined by the state of the database at initialization time
    assert_equal 3, UpdatableTestModel.class_variable_get(:@@latest_count_of_database_migrations)

    # New migrations won't immediately update the saved count
    ActiveRecord::SchemaMigration.any_instance.stubs(:count).returns(4)
    assert_equal 3, UpdatableTestModel.class_variable_get(:@@latest_count_of_database_migrations)

    # Invoking the "count and remember" method will
    UpdatableTestModel.new.send(:count_and_remember_database_migrations)
    assert_equal 4, UpdatableTestModel.class_variable_get(:@@latest_count_of_database_migrations)
  end

  test 'new_database_migration_since_initialization' do
    # Should be false just after initialization
    u = UpdatableTestModel.new
    refute u.send(:new_database_migration_since_initialization?)
    refute UpdatableTestModel.new.send(:new_database_migration_since_initialization?)

    # Adding a new migration to the set of migrations that have been executed
    # on this database should result in a positive detection.
    ActiveRecord::SchemaMigration.any_instance.stubs(:count).returns(4)
    assert u.send(:new_database_migration_since_initialization?)
    assert UpdatableTestModel.new.send(:new_database_migration_since_initialization?)
  end

  test 'assign_attributes will update cached information rather than raising an error when possible' do
    # Regular initialization works as expected
    UpdatableTestModel.new(foo: 'bar')

    # Initialization with a field that does not exist will raise an error if
    # the underlying database has not yet been updated.
    assert_raises ActiveModel::UnknownAttributeError do
      UpdatableTestModel.new(bar: 'baz')
    end

    # If the underlying database is updated such that the field does exist,
    # initialization will now work.
    ActiveRecord::SchemaMigration.any_instance.stubs(:count).returns(4)
    UpdatableTestModel.new(bar: 'baz')
  end
end
