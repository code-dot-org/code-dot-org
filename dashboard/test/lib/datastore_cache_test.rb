require 'test_helper'
require 'dynamic_config/datastore_cache'
require 'dynamic_config/adapters/memory_adapter'

class DatastoreCacheTest < ActiveSupport::TestCase
  class FakeListener
    attr_reader :changed

    def initialize
      reset
    end

    def reset
      @changed = false
    end

    def on_change
      @changed = true
    end
  end

  def setup
    @data_adapter = MemoryAdapter.new
  end

  test 'simple get and set' do
    cache = DatastoreCache.new @data_adapter
    key = "key"
    value = [1, 3, 2]

    cache.set(key, value)
    assert_equal value, cache.get(key)
  end

  test 'simple get and set with multiple listeners' do
    cache = DatastoreCache.new @data_adapter

    listener = FakeListener.new
    cache.add_change_listener(listener)

    key = "key"
    value = [1, 3, 2]

    refute listener.changed, 'on_change should not be called before change'
    cache.set(key, value)
    assert_equal value, cache.get(key)
    assert listener.changed, 'on_change should be called after local set'
    listener.reset

    # Add another listener, and verify that it receives change notifications too.
    value2 = [2, 4, 3]
    listener2 = FakeListener.new
    cache.add_change_listener(listener2)
    cache.set(key, value2)
    assert_equal value2, cache.get(key)
    assert listener.changed
    assert listener2.changed
    listener.reset
    listener2.reset

    # Set the same value and verify that the change listeners are not called.
    cache.set(key, value2)
    refute listener.changed
    refute listener2.changed
  end

  test 'cache is refreshed on update' do
    key = 'key'

    starting_value = 'start'
    updated_value = 'middle'
    final_value = 'end'

    @data_adapter.set(key, starting_value)
    cache = DatastoreCache.new @data_adapter

    listener = FakeListener.new
    cache.add_change_listener(listener)

    # If the underlying data changes directly, the cache is not updated.
    @data_adapter.set(key, updated_value)
    assert_equal starting_value, cache.get(key)
    refute listener.changed, 'on_change should not be called after direct update'

    # If the cache is updated, or a new cache it created, it fetches the new value.
    cache.update_cache
    assert_equal updated_value, cache.get(key)
    assert listener.changed, 'on_change should be called after full update'
    listener.reset

    # If the datastore cache is updated, the underlying value is updated.
    cache.set(key, final_value)
    assert_equal final_value, @data_adapter.get(key)
    assert_equal final_value, cache.get(key)
    assert listener.changed, 'on_change should be called after cache update'
  end

  test 'cache is shared' do
    key = 'key'

    starting_value = 'start'
    updated_value = 'update'

    @data_adapter.set(key, starting_value)

    first_cache = DatastoreCache.new @data_adapter
    second_cache = DatastoreCache.new @data_adapter

    assert_equal starting_value, first_cache.get(key)
    assert_equal starting_value, second_cache.get(key)

    first_cache.set(key, updated_value)
    assert_equal updated_value, second_cache.get(key)
  end

  test "set updates datastore and local cache" do
    cache = DatastoreCache.new @data_adapter
    @data_adapter.expects(:set).once
    cache.expects(:set_local).once
    cache.set("whatever", "yo")
  end

  test 'seeding data on init' do
    k = "yo"
    v = "dude"

    @data_adapter.set(k, v)
    @data_adapter.expects(:all).returns({}).once
    DatastoreCache.new @data_adapter
  end

  test 'datastore failure on init' do
    @data_adapter.stubs(:all).throws(StandardError)
    DatastoreCache.new @data_adapter
  end
end
