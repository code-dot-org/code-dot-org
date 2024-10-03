module Cdo
  # Lazily loads global configurations for regional pages
  module Global
    # Freezes an entire complex data structure
    def deep_freeze(data)
      if data.is_a?(Enumerable)
        data.each do |item|
          deep_freeze(item)
        end
      end

      data.freeze
    end

    # Retrieves the global configuration for the given region.
    def self.configuration_for(region)
      unless defined?(@@configurations)
        @@configurations = {}
      end

      return @@configurations[region] if @@configurations.key?(region)

      data = load_config(region)
      @@configurations[region] = deep_freeze(data)
    end

    # Retrieves a list a global region names.
    def self.regions
      unless defined?(@@regions)
        root = File.expand_path(File.join('..', '..'), __dir__)
        @@regions = Dir.glob(File.join(root, "config", "global", "*.yml")).map do |path|
          File.basename(path, File.extname(path)).intern
        end.freeze
      end

      @@regions
    end

    # Returns the parsed configuration for the given region.
    def self.load_config(region)
      root = File.expand_path(File.join('..', '..'), __dir__)
      data = YAML.load_file(File.join(root, "config", "global", "#{region}.yml")) || {}
      data.deep_symbolize_keys
    end
  end
end
