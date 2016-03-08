require 'test_helper'
require 'dynamic_config/datastore_cache'
require 'dynamic_config/adapters/memory_adapter.rb'

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

    assert !listener.changed, 'on_change should not be called before change'
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
    assert !listener.changed
    assert !listener2.changed
  end

  test 'cache is refreshed after expiration time' do
    key = "key"
    value = "1, 2, 3"

    @data_adapter.set(key, 'not the real value')
    cache = DatastoreCache.new @data_adapter, cache_expiration: 0.01

    listener = FakeListener.new
    cache.add_change_listener(listener)

    @data_adapter.set(key, value)
    sleep 0.1

    assert_equal value, cache.get(key)
    assert listener.changed, 'on_change should be called after polled updated'
    listener.reset
    sleep 0.1
    assert !listener.changed, 'on_change should not be called when polling detects no changes'

    @data_adapter.set(key, 'new value')
    sleep 0.1
    assert_equal 'new value', cache.get(key)
    assert listener.changed, 'on_change should be called after second polled updated'
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
