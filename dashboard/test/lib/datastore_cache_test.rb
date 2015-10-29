require 'test_helper'
require 'dynamic_config/datastore_cache'
require 'dynamic_config/adapters/memory_adapter.rb'

class DatastoreCacheTest < ActiveSupport::TestCase
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

  test 'cache is refreshed after expiration time' do
    key = "key"
    value = "1, 2, 3"

    @data_adapter.set(key, 'not the real value')
    cache = DatastoreCache.new @data_adapter, cache_expiration: 0.01

    @data_adapter.set(key, value)
    sleep 0.1

    assert_equal value, cache.get(key)
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
