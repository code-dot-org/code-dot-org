require 'test_helper'
require 'dynamic_config/datastore_cache'
require 'dynamic_config/adapters/memory_adapter'

class DatastoreCacheTest < ActiveSupport::TestCase
  def setup
    @data_adapter = MemoryAdapter.new
    @datastore_cache_identifier = 'default datastore cache for unit tests'
    @datastore_cache = DatastoreCache.new(@data_adapter, @datastore_cache_identifier)
  end

  test 'simple get and set' do
    key = 'key'
    first_value = [1, 3, 2]
    second_value = [2, 4, 3]

    assert_nil @datastore_cache.get(key)

    @datastore_cache.set(key, first_value)
    assert_equal first_value, @datastore_cache.get(key)

    @datastore_cache.set(key, second_value)
    assert_equal second_value, @datastore_cache.get(key)
  end

  test 'local_cache_expired? is updated on refresh and after time passes' do
    cache = DatastoreCache.new @data_adapter, 'fast expiration', cache_expiration: 5
    # Cache starts out fresh
    refute cache.local_cache_expired?

    # Cache expires after a configurable time period has elapsed
    travel 10.seconds
    assert cache.local_cache_expired?

    # Explicitly invoking a refresh will update expiration
    cache.update_local_cache
    refute cache.local_cache_expired?
    travel 10.seconds
    assert cache.local_cache_expired?

    # As will setting a new value
    cache.set('key', 'val')
    refute cache.local_cache_expired?
    travel 10.seconds
    assert cache.local_cache_expired?
  end

  test 'local cache is refreshed after expiration time' do
    key = 'key'
    initial_value = 'initial value'
    updated_value = '1, 2, 3'

    @data_adapter.set(key, initial_value)
    cache = DatastoreCache.new @data_adapter, 'fast expiration', cache_expiration: 5
    assert_equal initial_value, cache.get(key)

    # Local cache is not updated immediately when the shared cache is updated
    @data_adapter.set(key, updated_value)
    cache.populate_shared_cache
    refute cache.local_cache_expired?
    assert_equal initial_value, cache.get(key)

    # Local cache is eventually updated after the configurable expiration
    # period has elapsed
    travel 10.seconds
    assert cache.local_cache_expired?
    assert_equal updated_value, cache.get(key)
  end

  test 'shared cache is only refreshed from data store on creation and update' do
    key = 'test key'
    initial_value = 'initial test value'
    updated_value = 'updated test value'
    final_value = 'final test value'
    @datastore_cache.set(key, initial_value)

    # Directly updating the underlying data store will not immediately refresh
    # the shared cache
    @data_adapter.set(key, updated_value)
    @datastore_cache.update_local_cache
    assert_equal initial_value, @datastore_cache.get(key)

    # Creating a new cache instance with the same identifier (ie, a new
    # frontend server coming online) will trigger a refresh
    new_cache = DatastoreCache.new(@data_adapter, @datastore_cache_identifier)
    @datastore_cache.update_local_cache
    assert_equal updated_value, @datastore_cache.get(key)

    # Updating the value from any cache instance will trigger a refresh on all
    # instances with the same identifier.
    new_cache.set(key, final_value)
    @datastore_cache.update_local_cache
    assert_equal final_value, @datastore_cache.get(key)
  end

  test 'shared cache is shared between different datastore instances with the same identifier' do
    # This test is meant to mirror the interaction between datastore caches on
    # different frontend servers
    test_key = 'shared key'
    second_cache = DatastoreCache.new(@data_adapter, @datastore_cache_identifier)
    assert_equal @datastore_cache.shared_cache_key, second_cache.shared_cache_key

    initial_value = 'initial test value'
    @datastore_cache.set(test_key, initial_value)
    assert_equal({test_key => initial_value}, CDO.shared_cache.read(second_cache.shared_cache_key))
    assert_equal initial_value, @datastore_cache.get(test_key)
    second_cache.update_local_cache
    assert_equal initial_value, second_cache.get(test_key)

    updated_value = 'updated test value'
    second_cache.set(test_key, updated_value)
    assert_equal({test_key => updated_value}, CDO.shared_cache.read(second_cache.shared_cache_key))
    @datastore_cache.update_local_cache
    assert_equal updated_value, @datastore_cache.get(test_key)
    assert_equal updated_value, second_cache.get(test_key)
  end

  test 'shared cache is not shared between different datastore instances with different identifiers' do
    # This test is meant to mirror the interaction between the datastore cache
    # for DCDO and the one for Gatekeeper on the same frontend server
    test_key = 'shared key'
    second_cache = DatastoreCache.new(@data_adapter, 'a different datastore cache for unit tests')
    refute_equal @datastore_cache.shared_cache_key, second_cache.shared_cache_key

    initial_value = 'initial test value'
    @datastore_cache.set(test_key, initial_value)
    assert_equal({test_key => initial_value}, CDO.shared_cache.read(@datastore_cache.shared_cache_key))
    assert_equal({}, CDO.shared_cache.read(second_cache.shared_cache_key))
    assert_equal initial_value, @datastore_cache.get(test_key)
    second_cache.update_local_cache
    assert_nil second_cache.get(test_key)

    updated_value = 'updated test value'
    second_cache.set(test_key, updated_value)
    assert_equal({test_key => initial_value}, CDO.shared_cache.read(@datastore_cache.shared_cache_key))
    assert_equal({test_key => updated_value}, CDO.shared_cache.read(second_cache.shared_cache_key))
    @datastore_cache.update_local_cache
    assert_equal initial_value, @datastore_cache.get(test_key)
    assert_equal updated_value, second_cache.get(test_key)
  end

  test "set updates datastore and local cache" do
    @data_adapter.expects(:set).once
    @datastore_cache.expects(:populate_shared_cache).once
    @datastore_cache.expects(:update_local_cache).once
    @datastore_cache.set('whatever', 'yo')
  end

  test 'seeding data on init' do
    k = 'yo'
    v = 'dude'

    @data_adapter.set(k, v)
    @data_adapter.expects(:all).returns({}).once
    DatastoreCache.new @data_adapter, 'test initialization'
  end

  test 'datastore failure on init' do
    @data_adapter.stubs(:all).throws(StandardError)
    DatastoreCache.new @data_adapter, 'test initialization failure'
  end
end
