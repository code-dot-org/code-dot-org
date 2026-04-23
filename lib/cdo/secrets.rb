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

    # Maximum number of secrets that BatchGetSecretValue will return in a single call.
    # See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_BatchGetSecretValue.html
    BATCH_GET_MAX = 20

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
    def client_promise
      @client_promise ||= Concurrent::Promises.future_on(@pool) do
        @client || Aws::SecretsManager::Client.new
      end
    end

    # Add keys to list of required secrets, and begin pre-fetching them.
    def required(*keys, fetch: false)
      keys = keys.map(&:to_s)
      @required += keys
      keys.map {|key| get(key)} if fetch
    end

    # Ensure all required secrets are fully loaded.
    # @return [Hash] All keys and their resolved values.
    def required!(*keys)
      required(*keys)
      get_multi(*@required).value!
    end

    # Asynchronously fetch keys in parallel, batching the underlying calls to
    # AWS Secrets Manager via BatchGetSecretValue. Each batch retrieves up to
    # BATCH_GET_MAX secrets in a single request, which is dramatically faster
    # than issuing N individual GetSecretValue requests during startup.
    # @return [Concurrent::Promises::Future<Hash>] All keys and their resolved values
    def get_multi(*keys)
      keys = keys.map(&:to_s).uniq
      return Concurrent::Promises.fulfilled_future({}, @pool) if keys.empty?

      # Only fetch keys we don't already have cached (or in-flight) from a
      # previous call to get/get_multi.
      uncached = keys.reject {|key| @values.key?(key)}

      batch_future =
        if uncached.empty?
          Concurrent::Promises.fulfilled_future(true, @pool)
        else
          client_promise.then {|client| batch_fetch!(client, uncached)}
        end

      batch_future.then do
        promises = keys.map {|key| get(key).then {|value| [key, value]}}
        Concurrent::Promises.zip_futures_on(@pool, *promises).
          then {|*values| values.to_h}
      end.flat
    end

    # Asynchronously fetch specified key from Secrets Manager.
    # @return [Concurrent::Promises::Future<String>] Resolved value
    def get(key)
      key = key.to_s
      @values[key] ||= client_promise.then do |client|
        parse_json(get_secret_value(client, key))
      rescue => exception
        exception.message << " Key: #{key}"
        raise
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

    # Call GetSecretValue for the provided key.
    # @param client[Aws::SecretsManager::Client]
    # @param key[String]
    # @return [String]
    private def get_secret_value(client, key)
      logger&.info("GetSecretValue: #{key}")
      client.get_secret_value(
        secret_id: key,
        version_stage: CURRENT
      ).secret_string
    rescue NOT_FOUND => exception
      exception.set_backtrace []
      raise
    end

    # Fetch the provided keys from AWS Secrets Manager using BatchGetSecretValue,
    # populating the in-memory cache in @values so subsequent calls to +get+
    # return the already-fetched value without issuing another request.
    #
    # Keys that fail to resolve (e.g. because they are not present in AWS
    # Secrets Manager) are cached as rejected futures so that they surface the
    # same exception types callers would see from the single-key code path.
    #
    # @param client [Aws::SecretsManager::Client]
    # @param keys [Array<String>]
    private def batch_fetch!(client, keys)
      keys.each_slice(BATCH_GET_MAX) do |batch|
        logger&.info("BatchGetSecretValue: #{batch.length} key(s)")
        response = client.batch_get_secret_value(secret_id_list: batch)

        response.secret_values.each do |entry|
          parsed = parse_json(entry.secret_string)
          @values[entry.name] ||= Concurrent::Promises.fulfilled_future(parsed, @pool)
        end

        response.errors.each do |error|
          @values[error.secret_id] ||= Concurrent::Promises.rejected_future(
            build_batch_error(error), @pool
          )
        end
      end
      true
    end

    # Translate a BatchGetSecretValue error entry into the same exception type
    # that would be raised from a single-key GetSecretValue call, so callers
    # can continue to rescue +Cdo::Secrets::NOT_FOUND+ etc.
    #
    # @param error [Aws::SecretsManager::Types::APIErrorType]
    # @return [Aws::SecretsManager::Errors::ServiceError]
    private def build_batch_error(error)
      error_class =
        begin
          Aws::SecretsManager::Errors.const_get(error.error_code)
        rescue NameError
          Aws::SecretsManager::Errors::ServiceError
        end
      error_class.new(nil, "#{error.message} Key: #{error.secret_id}")
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
