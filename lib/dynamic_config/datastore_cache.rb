require 'honeybadger/ruby'
require 'cdo/shared_cache'

# A lightweight interface layer between Cdo::SharedCache and whichever
# datastore adapter is being used in the current environment, intended for use
# by Cdo::DynamicConfig.
class DatastoreCache
  CACHE_KEY = "DynamicConfigDatastore".freeze

  # @param datastore [Object] a datastore adapter
  # @param cache_expiration [int] seconds after which a cached entry expires
  def initialize(datastore, cache_expiration: 30)
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

  # Gets the data associated with a given key
  # @param key [String]
  # @returns stored value
  def get(key)
    raise ArgumentError unless key.is_a? String
    return all[key]
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
    return CDO.shared_cache.read(CACHE_KEY) || {}
  end

  # Clear the datastore
  def clear
    CDO.shared_cache.write(CACHE_KEY, {})
    @datastore.clear
    notify_change_listeners
  end

  # When unicorn preload the app and then forks worker processes the update_thread
  # doesn't make it to the other processes.  Restart it here
  def after_fork
    ## TODO: remove this method entirely, including all invocations
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
    updated_cache_data = all.merge({key => value})
    CDO.shared_cache.write(CACHE_KEY, updated_cache_data)
  end
end
