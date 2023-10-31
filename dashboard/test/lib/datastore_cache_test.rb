require 'test_helper'
require 'dynamic_config/datastore_cache'
require 'dynamic_config/adapters/memory_adapter'

class DatastoreCacheTest < ActiveSupport::TestCase
  def setup
    @data_adapter = MemoryAdapter.new
    @datastore_cache = DatastoreCache.new(@data_adapter, 'datastore cache unit test')
  end

  test 'simple get and set' do
    key = "key"
    first_value = [1, 3, 2]
    second_value = [2, 4, 3]

    assert_nil @datastore_cache.get(key)

    @datastore_cache.set(key, first_value)
    assert_equal first_value, @datastore_cache.get(key)

    @datastore_cache.set(key, second_value)
    assert_equal second_value, @datastore_cache.get(key)
  end

  test 'cache is refreshed after expiration time' do
    key = "key"
    initial_value = 'initial value'
    updated_value = "1, 2, 3"

    @data_adapter.set(key, initial_value)
    cache = DatastoreCache.new @data_adapter, 'fast expiration', cache_expiration: 0.01
    assert_equal initial_value, cache.get(key)

    # Local cache is not updated immediately when the shared cache is updated
    @data_adapter.set(key, updated_value)
    cache.populate_shared_cache
    refute cache.local_cache_expired?
    assert_equal initial_value, cache.get(key)

    # Local cache is eventually updated
    sleep 0.1
    assert cache.local_cache_expired?
    assert_equal updated_value, cache.get(key)
  end

  test "set updates datastore and local cache" do
    @data_adapter.expects(:set).once
    @datastore_cache.expects(:populate_shared_cache).once
    @datastore_cache.expects(:update_local_cache).once
    @datastore_cache.set("whatever", "yo")
  end

  test 'seeding data on init' do
    k = "yo"
    v = "dude"

    @data_adapter.set(k, v)
    @data_adapter.expects(:all).returns({}).once
    DatastoreCache.new @data_adapter, 'test initialization'
  end

  test 'datastore failure on init' do
    @data_adapter.stubs(:all).throws(StandardError)
    DatastoreCache.new @data_adapter, 'test initialization failure'
  end
end
