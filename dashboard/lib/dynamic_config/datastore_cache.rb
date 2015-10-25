# A caching layer that sits in front of a datastore that
# implements get and set
class DatastoreCache

  class ConcurrentRefreshError < StandardError
  end

  # @param datastore [Object]
  # @param cache_expiration [int] seconds after which a cached entry expires
  def initialize(datastore, cache_expiration: 5)
    @cache = {}
    @datastore = datastore
    @cache_expiration = cache_expiration

    @global_lock = Mutex.new
    @per_key_locks = {}

    seed_cache
  end

  # Gets the data associated with a given key
  # @param key [String]
  # @returns [?] stored value
  def get(key)
    if @cache.key? key
      cached_value, inserted_at = @cache[key]
      if Time.now.to_f - inserted_at < @cache_expiration
        return cached_value
      end
    end

    begin
      return refresh(key)
    rescue
      return @cache[key][0] if @cache.key? key
    end
    nil
  end

  # Update the cached value from the datastore. This uses Mutex's to
  # only allow one update per key at on time.
  # @param key [String]
  # @return value for key
  def refresh(key)
    lock = nil
    @global_lock.synchronize do
      if !@per_key_locks.key? key
        @per_key_locks[key] = Mutex.new
      end
      lock = @per_key_locks[key]
    end

    begin
      if lock.try_lock
        begin
          value = @datastore.get(key)
          set_local(key, value)
        ensure
          @global_lock.synchronize do
            @per_key_locks.delete key
          end
          lock.unlock
        end
      else
        raise ConcurrentRefreshError
      end
    end

    value
  end

  # Sets the given value for the key in both the local cache and datastore
  # @param key [String]
  # @param value [Anything]
  def set(key, value)
    @datastore.set(key, value)
    set_local(key, value)
  end

  # Sets the given value for the key in the local cache
  # @param key [String]
  # @param value [Anything]
  def set_local(key, value)
    @cache[key] = [value, Time.now.to_f]
  end

  # Pulls all values from the datastore and populates the local cache
  def seed_cache
    @datastore.all.each do |k, v|
      set_local(k, v)
    end
  end
end
