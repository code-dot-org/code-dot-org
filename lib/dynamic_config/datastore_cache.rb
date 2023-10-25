require 'honeybadger/ruby'

# A caching layer that sits in front of a datastore that
# implements get and set

class DatastoreCache
  # @param datastore [Object] a datastore adapter
  # @param cache_expiration [int] seconds after which a cached entry expires
  def initialize(datastore, cache_expiration: 30)
    @cache = {}
    @expirations = {}
    @datastore = datastore
    @cache_expiration = cache_expiration

    # A list of change listeners.
    @listeners = []

    update_cache
  end

  # Adds a listener that will be invoked whenever the store changes.
  # The listener must an object support a non-blocking
  # on_change() method which will be invoked in an arbitrary thread.
  def add_change_listener(listener)
    @listeners << listener
  end

  # Notifies each of the listeners that the store might have changed,
  # catching and logging exceptions.
  def notify_change_listeners
    @listeners.each do |listener|
      listener.on_change
    rescue => exception
      Rails.logger.warn("Error calling listener: #{exception.message}")
      Honeybadger.notify(exception)
    end
  end

  # Gets the data associated with a given key.
  #
  # Will return the cached data if it hasn't yet expired; if it has, this
  # method will fetch a fresh value, update the cache, and then return.
  # Notably, this means this method has inconsistent response time; it's
  # usually quick, but sometimes has to fetch data from a remote store.
  #
  # @param key [String]
  # @returns stored value
  def get(key)
    raise ArgumentError unless key.is_a? String
    old_value = @cache[key]
    return old_value if @expirations.key?(key) && @expirations[key] > Time.now
    new_value = @datastore.get(key)
    set(key, new_value)
    return new_value
  end

  # Sets the given value for the key in both the local cache and datastore
  #
  # @param key [String]
  # @param value [JSONable]
  def set(key, value)
    raise ArgumentError unless key.is_a? String
    old_value = @cache[key]
    @datastore.set(key, value)
    set_local(key, value)
    notify_change_listeners if value != old_value
  end

  # Return all cached elements
  def all
    @cache
  end

  # Clear the datastore
  def clear
    @cache = {}
    @datastore.clear
    notify_change_listeners
  end

  # Pulls all values from the datastore and populates the local cache
  def update_cache
    tries ||= 3
    updated = false
    begin
      @datastore.all.each do |key, value|
        old_value = @cache[key]
        set_local(key, value)
        updated = true if value != old_value
      end
      notify_change_listeners if updated
    rescue => exception
      retry unless (tries -= 1).zero?
      Honeybadger.notify(exception)
    end
  end

  # Sets the given value for the key in the local cache, with an expiration.
  #
  # @param key [String]
  # @param value [String]
  private def set_local(key, value)
    @cache[key] = value
    @expirations[key] = Time.new + @cache_expiration
  end
end
