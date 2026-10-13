module Policies
  module StandaloneProjects
    CONFIG_PATH = Rails.root.join('config/standalone_projects/standalone_projects.yml')
    STRING_KEYS = %w[name default_image_url].freeze
    BOOLEAN_KEYS = %w[i18n levelbuilder_required login_required].freeze
    ENTRY_KEYS = (STRING_KEYS | BOOLEAN_KEYS).freeze

    InvalidConfig = Class.new(StandardError)

    # Thoroughly validate the config at runtime, to pinpoint any issue that
    # would otherwise cause a misleading error when this config is loaded by
    # routes.rb during rails startup. Unit tests cannot be relied upon for this
    # validation, because rails startup errors prevent unit tests from running.
    def self.validate!(config)
      filename = CONFIG_PATH.basename
      raise InvalidConfig, "#{filename}: expected a map containing one key per project type, got #{config.inspect}" unless config.is_a?(Hash)

      config.each do |key, entry|
        prefix = "#{filename}: project type #{key.inspect}:"
        raise InvalidConfig, "#{prefix} /projects/<key> is not a valid URL path" unless key.to_s.match?(/\A[a-z0-9_]+\z/)
        raise InvalidConfig, "#{prefix} entry should be an indented block of settings, got #{entry.inspect}; check indentation" unless entry.is_a?(Hash)

        unknown = entry.keys - ENTRY_KEYS
        raise InvalidConfig, "#{prefix} entry has unknown keys #{unknown}; check indentation" unless unknown.empty?

        STRING_KEYS.each do |key_name|
          next unless entry.key?(key_name)
          raise InvalidConfig, "#{prefix} entry key #{key_name} must be a string, got #{entry[key_name].inspect}" unless entry[key_name].is_a?(String)
        end

        BOOLEAN_KEYS.each do |key_name|
          next unless entry.key?(key_name)
          raise InvalidConfig, "#{prefix} entry key #{key_name} must be true or false, got #{entry[key_name].inspect}" unless entry[key_name] == true || entry[key_name] == false
        end

        raise InvalidConfig, "#{prefix} entry needs a name" if entry['name'].blank?

        if entry.key?('default_image_url') && !entry['default_image_url'].start_with?('/')
          raise InvalidConfig, "#{prefix} default_image_url must be a root-relative path, got #{entry['default_image_url'].inspect}"
        end
      end
    end

    ALL = YAML.safe_load_file(CONFIG_PATH).tap {|config| validate!(config)}.with_indifferent_access.freeze

    def self.all
      ALL
    end

    def self.level_names
      ALL.values.pluck(:name)
    end

    def self.project_level_name?(name)
      level_names.include?(name)
    end
  end
end
