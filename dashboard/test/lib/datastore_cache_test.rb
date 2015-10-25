require 'test_helper'
require 'dynamic_config/datastore_cache'

class DatastoreCacheTest < ActiveSupport::TestCase
  class SlowDatastoreAdapter
    attr_accessor :get_call_count
    def initialize(delay: 0)
      @hash = {}
      @delay = delay
      @get_call_count = 0
    end

    def set(key, value)
      sleep @delay
      @hash[key] = value
    end

    def get(key)
      @get_call_count += 1
      sleep @delay
      @hash[key]
    end

    def all
      @hash
    end
  end

  test 'simple get and set' do
    data_adapter = SlowDatastoreAdapter.new
    cache = DatastoreCache.new data_adapter, cache_expiration: 0.01
    key = "key"
    value = [1, 3, 2]

    cache.expects(:refresh).never

    cache.set(key, value)
    assert_equal value, cache.get(key)
  end

  test 'value expires after expiration time' do
    key = "key"
    value = [1, 3, 2]

    data_adapter = SlowDatastoreAdapter.new
    cache = DatastoreCache.new data_adapter, cache_expiration: 0.01

    cache.set(key, value)
    sleep 0.1
    cached_value = cache.get(key)

    assert_equal value, cached_value

    # Expect us to pull from the datasource
    data_adapter.expects(:get).once
    sleep 0.1
    cache.get(key)
  end

  test "it won't refresh the same key at the same time" do
    data_adapter = SlowDatastoreAdapter.new(delay: 0.25)
    cache = DatastoreCache.new(data_adapter, cache_expiration: 0.01)

    key = "key"

    threads = []
    3.times do
      threads << Thread.new {
        begin
          cache.refresh(key)
        rescue
          #ignore
        end
      }
    end
    sleep 0.05
    assert_raise DatastoreCache::ConcurrentRefreshError do
      cache.refresh(key)
    end

    threads.each { |t| t.join }
    assert_equal data_adapter.get_call_count, 1
  end

  test "set updates datastore and local cache" do
    data_adapter = SlowDatastoreAdapter.new
    cache = DatastoreCache.new(data_adapter, cache_expiration: 0.01)
    data_adapter.expects(:set).once
    cache.expects(:set_local).once
    cache.set("whatever", "yo")
  end

  test "get returns the old cached value when concurrently refreshing" do
    data_adapter = SlowDatastoreAdapter.new
    cache = DatastoreCache.new(data_adapter, cache_expiration: 0)
    key =  "yo"
    value = "dude"
    cache.set(key, value)
    data_adapter.set(key, "nope")

    cache.stubs(:refresh).throws(DatastoreCache::ConcurrentRefreshError)
    assert_equal value, cache.get(key)
  end

  test 'seeding data on init' do
    data_adapter = SlowDatastoreAdapter.new
    k = "yo"
    v = "dude"

    data_adapter.set(k, v)
    cache = DatastoreCache.new(data_adapter)

    cache.expects(:refresh).never
    assert_equal v, cache.get(k)
  end
end
