module Policies
  module StandaloneProjects
    CONFIG_PATH = Rails.root.join('config/standalone_projects.yml')
    FLAG_KEYS = %w[i18n levelbuilder_required login_required].freeze
    ENTRY_KEYS = (%w[name default_image_url] + FLAG_KEYS).freeze
    BOOLEANS = [true, false].freeze

    InvalidConfig = Class.new(StandardError)

    # Checked at run time, not only in a unit test: routes.rb reads this
    # config early in boot, so a malformed file stops the app, and every test
    # with it, before any test can report it. Keys are strings here.
    def self.validate!(config)
      filename = CONFIG_PATH.basename
      raise InvalidConfig, "#{filename}: expected a map of /projects/<key> entries, got #{config.inspect}" unless config.is_a?(Hash)

      config.each do |key, entry|
        prefix = "#{filename}: entry #{key.inspect}"
        raise InvalidConfig, "#{prefix} is not a /projects/<key> URL segment" unless key.to_s.match?(/\A[a-z0-9_]+\z/)
        raise InvalidConfig, "#{prefix} should be an indented block of settings, got #{entry.inspect}; check indentation" unless entry.is_a?(Hash)

        unknown = entry.keys - ENTRY_KEYS
        raise InvalidConfig, "#{prefix} has unknown keys #{unknown}; check indentation" unless unknown.empty?

        name = entry['name']
        raise InvalidConfig, "#{prefix} needs a string name, got #{name.inspect}" unless name.is_a?(String) && !name.strip.empty?

        FLAG_KEYS.each do |flag|
          next unless entry.key?(flag)
          raise InvalidConfig, "#{prefix}: #{flag} must be true or false, got #{entry[flag].inspect}" unless BOOLEANS.include?(entry[flag])
        end

        if entry.key?('default_image_url') && !entry['default_image_url'].to_s.start_with?('/')
          raise InvalidConfig, "#{prefix}: default_image_url must be a root-relative path, got #{entry['default_image_url'].inspect}"
        end
      end

      duplicates = config.values.map {|entry| entry['name']}.tally.select {|_, count| count > 1}.keys
      raise InvalidConfig, "#{filename}: level names used by more than one entry: #{duplicates}" unless duplicates.empty?
    end

    # Indifferent access because callers index with both strings and symbols.
    ALL = YAML.safe_load_file(CONFIG_PATH).tap {|config| validate!(config)}.with_indifferent_access.freeze

    def self.all
      ALL
    end

    def self.level_names
      ALL.values.pluck(:name)
    end

    def self.level_name?(name)
      level_names.include?(name)
    end
  end
end
