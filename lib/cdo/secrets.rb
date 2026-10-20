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
    NOT_FOUND = ::Aws::SecretsManager::Errors::ResourceNotFoundException
    EXISTS = ::Aws::SecretsManager::Errors::ResourceExistsException
    # BatchGetSecretValue accepts at most 20 secret IDs per request.
    BATCH_SIZE = 20

    attr_accessor :logger

    def initialize(client: nil, required: [], logger: nil)
      @logger = logger

      # Cache fetched secrets in-memory in an instance-variable hash.
      @values = {}
      @values_lock = Mutex.new
      @client = client

      @pool = Concurrent::CachedThreadPool.new
      @required = Set.new
      required(*required)
    end

    # @return [Concurrent::Promises::Future<::Aws::SecretsManager::Client>] Secrets Manager Client
    def client_promise
      @client_promise ||= Concurrent::Promises.future_on(@pool) do
        @client || ::Aws::SecretsManager::Client.new
      end
    end

    # Add keys to list of required secrets, and begin pre-fetching them.
    def required(*keys, fetch: false)
      keys = keys.map(&:to_s)
      @required += keys
      get_multi(*keys) if fetch
    end

    # Ensure all required secrets are fully loaded.
    # @return [Hash] All keys and their resolved values.
    def required!(*keys)
      required(*keys)
      get_multi(*@required).value!
    end

    # Asynchronously fetch keys, up to BATCH_SIZE per request, with the requests in parallel.
    # @return [Concurrent::Promises::Future<Hash>] All keys and their resolved values
    def get_multi(*keys)
      keys = keys.map(&:to_s).uniq
      return Concurrent::Promises.fulfilled_future({}, @pool) if keys.empty?
      fetch(keys)
      promises = keys.map {|key| @values[key].then {|value| [key, value]}}
      Concurrent::Promises.zip_futures_on(@pool, *promises).
        then {|*values| values.to_h}
    end

    # Asynchronously fetch specified key from Secrets Manager.
    # The first lookup of a required key also fetches every required key not yet fetched.
    # @return [Concurrent::Promises::Future<String>] Resolved value
    def get(key)
      key = key.to_s
      fetch(@required.include?(key) ? [key, *@required] : [key]) unless @values.key?(key)
      @values[key]
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
      c = client_promise.value!
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

    # Start fetching each of +keys+ not already fetched, one BatchGetSecretValue request per BATCH_SIZE keys.
    # @param keys[Array<String>]
    private def fetch(keys)
      @values_lock.synchronize do
        (keys.uniq - @values.keys).each_slice(BATCH_SIZE) do |batch|
          batch_values = client_promise.then {|client| batch_get_secret_values(client, batch)}
          batch.each do |key|
            @values[key] = batch_values.then do |values|
              parse_json(values.fetch(key) {get_secret_value(client_promise.value!, key)})
            rescue => exception
              exception.message << " Key: #{key}"
              raise
            end
          end
        end
      end
    end

    # Call BatchGetSecretValue for up to BATCH_SIZE keys. Keys left out are retried with GetSecretValue.
    # @param client[::Aws::SecretsManager::Client]
    # @param keys[Array<String>]
    # @return [Hash<String, String>] Secret names and their values
    private def batch_get_secret_values(client, keys)
      response = client.batch_get_secret_value(secret_id_list: keys)
      # The SDK returns nil, not [], for a list absent from the response.
      Array(response.secret_values).to_h {|secret| [secret.name, secret.secret_string]}
    # Any failure, e.g. a role not yet granted secretsmanager:BatchGetSecretValue, leaves every key to GetSecretValue.
    rescue => exception
      logger&.warn("BatchGetSecretValue failed, falling back to GetSecretValue: #{exception.message}")
      {}
    end

    # Call GetSecretValue for the provided key.
    # @param client[::Aws::SecretsManager::Client]
    # @param key[String]
    # @return [String]
    private def get_secret_value(client, key)
      client.get_secret_value(
        secret_id: key,
        version_stage: CURRENT
      ).secret_string
    rescue NOT_FOUND => exception
      exception.set_backtrace []
      raise
    end

    # If +value+ is a JSON array, return an Array.
    # If +value+ is a JSON object, return a Hash.
    # Otherwise, return +value+ cast to String.
    #
    # @param value[String]
    # @return [Array, Hash, String]
    private def parse_json(value)
      parsed = JSON.parse(value)
      return parsed if parsed.is_a?(Array) || parsed.is_a?(Hash)
      return parsed.to_s
    rescue JSON::ParserError, TypeError
      value
    end
  end
end
