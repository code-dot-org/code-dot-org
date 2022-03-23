# A dynamic configuration module that allows us to update
# config settings without pushing new code.

require 'dynamic_config/datastore_cache'
require 'dynamic_config/dynamic_config_base'
require 'dynamic_config/adapters/dynamodb_adapter'
require 'dynamic_config/adapters/json_file_adapter'
require 'dynamic_config/adapters/memory_adapter'

class DCDOBase < DynamicConfigBase
  # Adds a listener whose on_change() method will be invoked at least
  # once whenever the configuration changes. The on_change() method
  # will be invoked on an arbitrary thread and must not block.
  def add_change_listener(listener)
    @datastore_cache.add_change_listener(listener)
  end

  # Updates the cached configuration, for testing only.
  def update_cache_for_test
    @datastore_cache.update_cache
  end

  # Factory method for creating DCDOBase objects
  # @returns [DCDOBase]
  def self.create
    env = rack_env.to_s
    env = Rails.env.to_s if defined?(Rails) && Rails.respond_to?(:env)

    cache_expiration = 5
    if env == 'test'
      adapter = MemoryAdapter.new
    elsif env == 'production'
      cache_expiration = 30
      adapter = DynamoDBAdapter.new CDO.dcdo_table_name
    else
      adapter = JSONFileDatastoreAdapter.new("#{dashboard_dir(CDO.dcdo_table_name)}_temp.json")
    end

    datastore_cache = DatastoreCache.new adapter, cache_expiration: cache_expiration
    DCDOBase.new datastore_cache
  end

  # Generate the a mapping of DCDO configurations we want to forward to frontend code so it can have
  # access to the values. For example, boolean DCDO config could be used to turn a new feature on or
  # off.
  # Please note that for the frontend Javascript code, this data could be stale due to the caching
  # behavior of the page. Analyze the HTTP headers of the pages you are interested in to understand
  # what kind of caching they use and if that will be a concern.
  # @return [Hash] A mapping of DCDO keys to values which we want frontend code to have access to.
  def frontend_config
    # Add DCDO configurations you would like to be available on the frontend/javascript.
    # For example:
    # 'my-new-feature': DCDO.get('my-new-feature', false)
    {
      'frontend-i18n-tracking': DCDO.get('frontend-i18n-tracking', false)
    }
  end
end

DCDO = DCDOBase.create
