require 'cdo/shared_cache'


# A multilayered caching interface intended for use by Cdo::DynamicConfig. Ties
# together three different components:
#
#   1. The long-lived datastore, which in production is DynamoDB. This is the
#      ultimate source of truth for the current state of our configuration
#      settings, and will only be read from on initialization and when a
#      configuration value is updated.
#
#   2. The shared cache, which in production is ElastiCache using Memcached.
#      This is a middle ground shared between the frontend processes which will
#      be kept up to date with the content in the datastore and from which
#      processes will fetch updates on a configurable schedule.
#
#   3. The local in-memory cache, which in all environments is a simple hash.
#      Each frontend processes will reference its local cache to serve the
#      vast majority of user requests, and will occasionally update its
#      contents from the shared cache.
class DatastoreCache
  SHARED_CACHE_NAMESPACE = "DynamicConfigData".freeze

  # @param datastore [Object] a datastore adapter
  # @param identifier [String] a unique identifier for this instance of
  #        datastore cache; used to prevent DCDO and Gatekeeper from trying to
  #        store things in the same place.
  # @param cache_expiration [int] seconds after which a cached entry expires
  def initialize(datastore, identifier, cache_expiration: 30)
    @datastore = datastore
    @identifier = identifier

    # Set up our local cache; a simple in-memory hashed used to rapidly respond
    # to user requests which is occasionally refreshed from the shared cache to
    # pick up changes.
    @local_cache = {}
    @local_cache_expiration = cache_expiration
    @local_cache_last_refreshed_at = nil

    populate_shared_cache
    update_local_cache
  end

  def shared_cache_key
    [SHARED_CACHE_NAMESPACE, @identifier].join('/')
  end

  def local_cache_expired?
    expires_at = @local_cache_last_refreshed_at + @local_cache_expiration
    return expires_at <= Time.now
  end

  # Gets the data associated with a given key
  # @param key [String]
  # @returns stored value
  def get(key)
    raise ArgumentError unless key.is_a? String
    update_local_cache if local_cache_expired?
    return @local_cache[key]
  end

  # Sets the given value for the key in the datastore, and update both the
  # shared and local caches in response.
  # @param key [String]
  # @param value [JSONable]
  def set(key, value)
    raise ArgumentError unless key.is_a? String
    @datastore.set(key, value)
    populate_shared_cache
    update_local_cache
  end

  # Return all cached elements
  def all
    @local_cache
  end

  # Clear the datastore
  def clear
    @local_cache = {}
    CDO.shared_cache.write(shared_cache_key, {})
    @datastore.clear
  end

  # Pulls all values from the datastore and populates the shared cache. Should
  # only be called infrequently, as we need to query DynamoDB for each
  # individual record.
  def populate_shared_cache
    tries ||= 3
    begin
      CDO.shared_cache.write(shared_cache_key, @datastore.all)
    rescue => exception
      retry unless (tries -= 1).zero?
      Harness.error_notify(exception)
    end
  end

  # Updates the local cache with the latest values from the shared cache. Can
  # be called regularly, but only for a small subset of user requests.
  def update_local_cache
    @local_cache = CDO.shared_cache.read(shared_cache_key) || {}
    @local_cache_last_refreshed_at = Time.now
  end
end
