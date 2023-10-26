require 'honeybadger/ruby'
require 'cdo/shared_cache'

# A lightweight interface layer between Cdo::SharedCache and whichever
# datastore adapter is being used in the current environment, intended for use
# by Cdo::DynamicConfig.
class DatastoreCache
  CACHE_NAMESPACE = "DynamicConfigData".freeze
  ALL_CACHED_KEYS = [CACHE_NAMESPACE, :all_keys].join('/')

  # @param datastore [Object] a datastore adapter
  def initialize(datastore)
    @datastore = datastore

    # A list of change listeners.
    @listeners = []

    # Update the cache to populate it with initial values, and provide a
    # reasonable default for our set of all cache keys.
    update_cache
    CDO.shared_cache.fetch(ALL_CACHED_KEYS) {Set.new}
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

  # Given a key representing a Cdo::DynamicConfig value, return the namespaced
  # key used to fetch the corresponding value from Cdo::SharedCache
  # @param key [String] a DCDO/Gatekeeper key; ie, "hoc_mode"
  # @return [String] a SharedCache key; ie, "DynamicConfigData/value/hoc_mode"
  def namespaced_cache_key(key)
    return [CACHE_NAMESPACE, :value, key].join('/')
  end

  # Gets the data associated with a given key
  # @param key [String]
  # @returns stored value
  def get(key)
    raise ArgumentError unless key.is_a? String
    return CDO.shared_cache.read(namespaced_cache_key(key))
  end

  # Sets the given value for the key in both the local cache and datastore
  # @param key [String]
  # @param value [JSONable]
  def set(key, value)
    raise ArgumentError unless key.is_a? String
    old_value = get(key)
    @datastore.set(key, value)
    set_local(key, value)
    notify_change_listeners if value != old_value
  end

  # Return all cached elements
  def all
    return CDO.shared_cache.read(ALL_CACHED_KEYS).map do |key|
      [key, CDO.shared_cache.read(namespaced_cache_key(key))]
    end.to_h
  end

  # Clear the datastore
  def clear
    CDO.shared_cache.read(ALL_CACHED_KEYS).each do |key|
      CDO.shared_cache.delete(namespaced_cache_key(key))
    end
    CDO.shared_cache.write(ALL_CACHED_KEYS, Set.new)
    @datastore.clear
    notify_change_listeners
  end

  # Pulls all values from the datastore and populates the local cache
  def update_cache
    tries ||= 3
    updated = false
    begin
      @datastore.all.each do |key, value|
        old_value = get(key)
        set_local(key, value)
        updated = true if value != old_value
      end
      notify_change_listeners if updated
    rescue => exception
      retry unless (tries -= 1).zero?
      Honeybadger.notify(exception)
    end
  end

  # Sets the given value for the key in the local cache
  # @param key [String]
  # @param value [String]
  private def set_local(key, value)
    new_cached_keys = CDO.shared_cache.read(ALL_CACHED_KEYS).union(Set[key])
    CDO.shared_cache.write(ALL_CACHED_KEYS, new_cached_keys)
    CDO.shared_cache.write(namespaced_cache_key(key), value)
  end
end
