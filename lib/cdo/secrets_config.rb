require 'cdo/config'
require 'cdo/lazy'
require 'aws-sdk-ec2'
require 'net/http'

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

    def freeze_config
      lazy_load_secrets!
      super
    end

    def render(*sources)
      super.tap do |configs|
        configs.each(&method(:process_secrets!))
      end
    end

    # Stores a reference to a secret so it can be resolved later.
    #
    # Specifically, stores a reference to both the unique key which can
    # identify the secret and a prefix which can identify which environment's
    # secrets we should use.
    Secret = Struct.new(:secret_prefix, :secret_key) do
      def key
        SecretsConfig.secret_path(secret_prefix, secret_key)
      end

      def to_s
        "${#{key}}"
      end

      # Resolve the secret referenced by this object.
      def lookup(secrets_manager)
        secrets_manager.get!(key)
      end
    end

    class StackSecret < Secret
      # This attribute is used by the Cdo::Secrets.required (and require!) methods to determine which AWS Secret to get.
      def key
        stack_specific_secret_path
      end

      # Extend the default lookup functionality to support checking for
      # stack-specific secrets, defaulting to the original functionality if
      # none are found.
      def lookup(secrets_manager)
        # First try looking for a Stack-specific secret.
        stack_specific_secret_path ? secrets_manager.get!(stack_specific_secret_path) : super
      rescue Aws::SecretsManager::Errors::ValidationException
        # We're likely executing in an environment that's not part of a
        # CloudFormation Stack, so the secret name was invalid (nil). Fall back
        # to looking up the environment type secret.
        super
      rescue Aws::SecretsManager::Errors::ResourceNotFoundException
        # Fall back to looking up a secret shared by all deployments with the
        # same environment-type ('development', 'test', 'production', etc.).
        super
      end

      # Generate path to a Secret that was provisioned for a specific
      # CloudFormation Stack. This enables configuration settings to have
      # different values for different deployments that have the same
      # environment type.
      #
      # Note that we use `secret_key` for this rather than `key`, since the
      # latter is environment-specific and we want stack-specific overrides to
      # apply to all environments.
      def stack_specific_secret_path
        @stack ||= Cdo::SecretsConfig::StackSecret.current_stack_name
        @stack ? "CfnStack/#{@stack}/#{secret_key}" : nil
      end

      EC2_METADATA_SERVICE_BASE_URL = URI('http://169.254.169.254/latest/meta-data/')

      # Get the CloudFormation Stack Name that the EC2 Instance this code is executing on belongs to.
      # @return [String]
      def self.current_stack_name
        metadata_service_request = Net::HTTP.new(EC2_METADATA_SERVICE_BASE_URL.host, EC2_METADATA_SERVICE_BASE_URL.port)
        # Set a short timeout so that when not executing on an EC2 Instance we fail fast.
        metadata_service_request.open_timeout = metadata_service_request.read_timeout = 10
        ec2_instance_id = metadata_service_request.request_get(EC2_METADATA_SERVICE_BASE_URL.path + 'instance-id').body
        region = metadata_service_request.request_get(EC2_METADATA_SERVICE_BASE_URL.path + 'placement/region').body
        ec2_client = Aws::EC2::Client.new(region: region)
        ec2_client.
          describe_tags({filters: [{name: "resource-id", values: [ec2_instance_id]}]}).
          tags.
          select {|tag| tag.key == 'aws:cloudformation:stack-name'}.
          first.
          value
      rescue Net::OpenTimeout # This code is not executing on an AWS EC2 Instance nor in an ECS container or Lambda.
        nil
      rescue StandardError
        nil
      end
    end

    SECRET_REGEX = /\${(.*)}/
    YAML.add_domain_type('', 'Secret') {Secret.new}
    YAML.add_domain_type('', 'StackSecret') {StackSecret.new}

    # Processes `Secret` references in the provided config hash.
    private def process_secrets!(config)
      return if config.nil?
      config.select {|_, v| v.is_a?(Secret)}.each do |key, secret|
        # The secret_prefix attribute is ignored by  StackSecrets. They use the stack_specific_secret_path method
        # to compute the full AWS Secret name.
        secret.secret_prefix ||= env
        secret.secret_key ||= key
      end
    end

    # Resolve secret references to lazy-loaded values.
    private def lazy_load_secrets!
      self.cdo_secrets ||= Cdo.lazy do
        require 'cdo/secrets'
        Cdo::Secrets.new(logger: log)
      end

      @table.select {|_k, v| v.to_s.match(SECRET_REGEX)}.each do |key, value|
        cdo_secrets.required(*value.to_s.scan(SECRET_REGEX).flatten)
        @table[key] = Cdo.lazy do
          if value.is_a?(Secret)
            value.lookup(cdo_secrets)
          else
            # TODO: Do we need to modify this use case as well to get a stack specific secret?
            CDO.log.info "This weird code path was used for CDO configuration setting: #{key}"
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
    private def clear_secrets
      @secrets ||= []
      @secrets |= @table.select {|_, v| v.is_a?(Secret)}.keys.map(&:to_s)
      @secrets.product([nil]).to_h.to_yaml.sub(/^---.*\n/, '')
    end
  end
end
