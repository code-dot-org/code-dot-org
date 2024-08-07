module EnvironmentAwareDynamicConfigHelper
  def self.create_datastore_cache(identifier)
    cache_expiration = 5

    if rack_or_rails_env == 'test' && !CDO.running_web_application?
      # Use the memory adapter if we're running unit tests, but not if we're
      # running the web application server.
      adapter = MemoryAdapter.new
      # Append the test env number to prevent conflicts between parallel tests
      identifier = "#{identifier}#{ENV.fetch('TEST_ENV_NUMBER', nil)}"
    elsif rack_or_rails_env == 'production' || managed_test_server?
      # Production and the managed test system web application servers
      # (test.code.org / studio.code.org) use DynamoDB.
      cache_expiration = 30
      adapter = DynamoDBAdapter.new(identifier)
    else
      # Everything else writes out to the local filesystem
      file_path = "#{dashboard_dir(identifier)}_temp.json"
      adapter = JSONFileDatastoreAdapter.new(file_path)
    end

    return DatastoreCache.new(adapter, identifier, cache_expiration: cache_expiration)
  end

  def self.rack_or_rails_env
    env = rack_env.to_s
    env = Rails.env.to_s if defined?(Rails) && Rails.respond_to?(:env)
    return env
  end

  def self.managed_test_server?
    CDO.test_system? && CDO.running_web_application?
  end
end
