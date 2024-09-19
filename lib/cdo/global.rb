module Cdo
  # Lazily loads global configurations for regional pages
  module Global
    # Retrieves the global configuration for the given region.
    def self.configuration_for(region)
      unless defined?(@@configurations)
        @@configurations = {}
      end

      return @@configurations[region] if @@configurations.key?(region)

      @@configurations[region] = load_config(region)
    end

    # Retrieves a list a global region names.
    def self.regions
      unless defined?(@@regions)
        root = File.expand_path(File.join('..', '..'), __dir__)
        @@regions = Dir.glob(File.join(root, "config", "global", "*.yml")).map do |path|
          File.basename(path, File.extname(path)).intern
        end
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
