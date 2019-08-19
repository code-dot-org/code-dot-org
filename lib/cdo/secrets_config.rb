require 'cdo/config'
require 'cdo/lazy'

module Cdo
  # Prepend this module to a Cdo::Config to process lazy-loaded secrets contained in special tags.
  module SecretsConfig
    BASE_ENVS = [:staging, :test, :levelbuilder, :production]

    # Generate a standard secret path from prefix and key.
    def self.secret_path(prefix, key)
      "#{prefix}/cdo/#{key}"
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
    Secret = Struct.new(:key)

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

      table.select {|_k, v| v.is_a?(Secret)}.each do |key, secret|
        table[key] = cdo_secrets.lazy(secret.key, raise_not_found: true)
        define_singleton_method(key) do
          # Replace lazy references to the underlying object on first access,
          # in order to support 'falsey' (false / nil) values.
          val = @table[key]
          val = @table[key] = val.__getobj__ if val.respond_to?(:__getobj__)
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
