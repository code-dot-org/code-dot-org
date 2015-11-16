require 'honeybadger'

# A caching layer that sits in front of a datastore that
# implements get and set

class DatastoreCache
  # @param datastore [Object] a datastore adapter
  # @param cache_expiration [int] seconds after which a cached entry expires
  def initialize(datastore, cache_expiration: 30)
    @cache = {}
    @datastore = datastore
    @cache_expiration = cache_expiration

    # Note we intentionally do this before spawning the background thread
    # to make sure the cache is seeded successfully on init
    update_cache
    @update_thread = spawn_update_thread
  end

  # Gets the data associated with a given key
  # @param key [String]
  # @returns stored value
  def get(key)
    raise ArgumentError unless key.is_a? String
    return @cache[key]
  end

  # Sets the given value for the key in both the local cache and datastore
  # @param key [String]
  # @param value [JSONable]
  def set(key, value)
    raise ArgumentError unless key.is_a? String
    @datastore.set(key, value)
    set_local(key, value)
  end

  # Return all cached elements
  def all
    @cache
  end

  # Clear the datastore
  def clear
    @cache = {}
    @datastore.clear
  end

  # When unicorn preload the app and then forks worker processes the update_thread
  # doesn't make it to the other processes.  Restart it here
  def after_fork
    @update_thread = spawn_update_thread unless @update_thread && @update_thread.alive?
  end

  # Pulls all values from the datastore and populates the local cache
  def update_cache
    tries ||= 3
    @datastore.all.each do |k, v|
      set_local(k, v)
    end
  rescue => exc
    retry unless (tries -= 1).zero?
    Honeybadger.notify(exc)
  end

  private

  # Sets the given value for the key in the local cache
  # @param key [String]
  # @param value [String]
  def set_local(key, value)
    @cache[key] = value
  end

  # Spawns a background thread that periodically updates the cached
  # values from the persistent datastore
  def spawn_update_thread
    Thread.new do
      loop do
        sleep @cache_expiration
        update_cache
      end
    end
  end
end
