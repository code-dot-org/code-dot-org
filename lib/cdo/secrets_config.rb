require 'cdo/config'
require 'cdo/lazy'

module Cdo
  # Prepend this module to a Cdo::Config to process lazy-loaded secrets contained in special tags.
  module SecretsConfig
    BASE_ENVS = [:staging, :test, :levelbuilder, :production]

    # Generate a standard secret path from prefix and key.
    # These secrets are specific to an environment type (adhoc, staging, development, etc.) and could potentially
    # be shared across multiple deployments that have the same environment type (such as 2 different adhocs).
    def self.secret_path(prefix, key)
      "#{prefix}/cdo/#{key}"
    end

    # Generate path to a Secret that was provisioned for a specific CloudFormation Stack. This enables
    # configuration settings to have different values for different deployments that have the same environment type.
    def self.stack_specific_secret_path(key)
      stack = current_stack_name
      stack ? "CfnStack/#{stack}/#{key}" : nil
    end

    # Load a secrets-config hash from specified file.
    # @param filename [String]
    # @return [Hash<String, String|Hash>]
    def self.load(filename)
      results = {}
      YAML.load_file(filename)&.each do |key, envs|
        envs.each do |env, value|
          if env == 'base'
            BASE_ENVS.each do |base_env|
              results[secret_path(base_env, key)] = value.dup
            end
          else
            raise "Invalid env: #{env}" unless CDO.rack_envs.include?(env.to_sym)
            results[secret_path(env, key)] = value
          end
        end
      end
      results
    end

    def freeze
      lazy_load_secrets!
      super
    end

    def render(*sources)
      super.tap do |configs|
        configs.each(&method(:process_secrets!))
      end
    end

    private

    # Stores a reference to a secret so it can be resolved later.
    Secret = Struct.new(:key) do
      def to_s
        "${#{key}}"
      end
    end

    SECRET_REGEX = /\${(.*)}/
    YAML.add_domain_type('', 'Secret') {Secret.new}

    # Processes `Secret` references in the provided config hash.
    def process_secrets!(config)
      return if config.nil?
      config.select {|_, v| v.is_a?(Secret)}.each do |key, secret|
        secret.key ||= SecretsConfig.secret_path(env, key)
      end
    end

    # Resolve secret references to lazy-loaded values.
    def lazy_load_secrets!
      self.cdo_secrets ||= Cdo.lazy do
        require 'cdo/secrets'
        Cdo::Secrets.new(logger: log)
      end

      table.select {|_k, v| v.to_s.match(SECRET_REGEX)}.each do |key, value|
        cdo_secrets.required(*value.to_s.scan(SECRET_REGEX).flatten)
        table[key] = Cdo.lazy do
          stack_specific_secret_path = AWS::CloudFormation.stack_specific_secret_path(key)
          if value.is_a?(Secret)
            begin
              # First try looking for a Stack-specific secret.
              stack_specific_secret_path ? cdo_secrets.get!(stack_specific_secret_path) : cdo_secrets.get!(value.key)
            rescue Aws::SecretsManager::Errors::ValidationException
              # We're likely executing in an environment that's not part of a CloudFormation Stack, so the secret name was
              # invalid (nil). Fall back to looking up the environment type secret.
              cdo_secrets.get!(value.key)
            rescue Aws::SecretsManager::Errors::ResourceNotFoundException
              # Fall back to looking up a secret shared by all deployments with the same environment-type
              # ('development', 'test', 'production', etc.).
              cdo_secrets.get!(value.key)
            end
          else
            # TODO: Do we need to modify this use case as well to get a stack specific secret?
            CDO.log.info "This weird code path was used for CDO configuration setting: #{key} / value: #{value}"
            value.to_s.gsub(SECRET_REGEX) {cdo_secrets.get!($1)}
          end
        end

        # Replace lazy references to the underlying object on first access,
        # in order to support 'falsey' (false / nil) values.
        define_singleton_method(key) do
          val = @table[key]
          val = @table[key] = val.__getobj__ if val.is_a?(Cdo::Lazy)
          val
        end
      end
    end

    # Returns a YAML fragment clearing all secrets by overriding their values to `nil`.
    # Any exceptions or defaults can be re-added later in the YAML document, after secrets have been cleared.
    def clear_secrets
      @secrets ||= []
      @secrets |= table.select {|_, v| v.is_a?(Secret)}.keys.map(&:to_s)
      @secrets.product([nil]).to_h.to_yaml.sub(/^---.*\n/, '')
    end
  end
end
