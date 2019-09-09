require 'aws-sdk-secretsmanager'
require 'concurrent'
require 'active_support/ordered_options'
require 'active_support/core_ext/hash/keys'
require 'cdo/lazy'
require 'json'

module Cdo
  # Interface for fetching secrets from AWS Secrets Manager.
  class Secrets
    CURRENT = "AWSCURRENT".freeze
    NOT_FOUND = Aws::SecretsManager::Errors::ResourceNotFoundException
    EXISTS = Aws::SecretsManager::Errors::ResourceExistsException

    attr_accessor :logger

    def initialize(client: nil, required: [], logger: nil)
      @logger = logger

      # Cache fetched secrets in-memory in an instance-variable hash.
      @values = {}
      @client = client

      @pool = Concurrent::CachedThreadPool.new
      @required = Set.new
      required(*required)
    end

    # @return [Concurrent::Promises::Future<Aws::SecretsManager::Client>] Secrets Manager Client
    def client
      @client_promise ||= Concurrent::Promises.future_on(@pool) do
        @client || Aws::SecretsManager::Client.new
      end
    end

    # Add keys to list of required secrets, and begin pre-fetching them.
    def required(*keys, fetch: false)
      keys = keys.map(&:to_s)
      @required += keys
      keys.map(&method(:get)) if fetch
    end

    # Ensure all required secrets are fully loaded.
    # @return [Hash] All keys and their resolved values.
    def required!(*keys)
      required(*keys)
      get_multi(*@required).value!
    end

    # Asynchronously fetch keys in parallel.
    # @return [Concurrent::Promises::Future<Hash>] All keys and their resolved values
    def get_multi(*keys)
      client.then do
        promises = keys.map {|key| get(key).then {|value| [key, value]}}
        Concurrent::Promises.zip_futures_on(@pool, *promises).
          then {|*values| values.to_h}
      end.flat
    end

    # Asynchronously fetch specified key from Secrets Manager.
    # @return [Concurrent::Promises::Future<String>] Resolved value
    def get(key)
      key = key.to_s
      @values[key] ||= begin
        client.then do |client|
          parse_json(get_secret_value(client, key))
        rescue => e
          e.message << " Key: #{key}"
          raise
        end
      end
    end

    # Alternate lookup: Raise exception if secret is not found.
    def get!(key)
      get(key).value!
    end

    # Alternate lookup: secrets['secret']
    def [](key)
      get(key).value
    end

    # Alternate lookup: secrets.secret
    def method_missing(key, *args)
      return super unless args.empty?
      get(key).value
    end

    # Wraps a Secret value in a Lazy object so that the API call to
    # +GetSecretValue+ won't be performed until the secret is actually used.
    # @param fetch[Boolean] asynchronously load the object in the background
    # @param fallback[String] Fallback string to return if secret is not found.
    # @param raise_not_found[Boolean] Raise exception if secret is not found.
    def lazy(key, fetch: false, fallback: nil, raise_not_found: false)
      key = key.to_s
      required(key, fetch: fetch)
      Cdo.lazy do
        if raise_not_found
          get(key).value!
        else
          get(key).value || fallback
        end
      end
    end

    # Ensure cached instance-variable values don't end up in any logs.
    def inspect
      self.class.to_s
    end

    # Create/update a stored secret.
    # @param key [String]
    # @param value [String, Object]
    def put(key, value)
      value = value.to_json unless value.is_a?(String)
      c = client.value!
      c.create_secret(
        name: key,
        secret_string: value
      )
    rescue EXISTS
      c.update_secret(
        secret_id: key,
        secret_string: value
      )
    end

    private

    # Call GetSecretValue for the provided key.
    # @param client[Aws::SecretsManager::Client]
    # @param key[String]
    # @return [String]
    def get_secret_value(client, key)
      logger&.info("GetSecretValue: #{key}")
      client.get_secret_value(
        secret_id: key,
        version_stage: CURRENT
      ).secret_string
    rescue NOT_FOUND => e
      e.set_backtrace []
      raise
    end

    # If +value+ is JSON, parse and wrap in ActiveSupport::OrderedOptions so
    # property-method lookup chains are possible (e.g., secrets.secret.key).
    # @param value[String]
    # @return [ActiveSupport::OrderedOptions, String]
    def parse_json(value)
      ActiveSupport::OrderedOptions[JSON.parse(value).symbolize_keys]
    rescue JSON::ParserError, TypeError
      value
    end
  end
end
