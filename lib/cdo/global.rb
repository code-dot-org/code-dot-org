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
      @@configurations ||= {}
      @@configurations[region] ||= load_config(region)
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
      raise ArgumentError, "Region #{region} is not available" unless REGIONS.include?(region)
      configs = YAML.load_file(CDO.dir('config', 'global', "#{region}.yml")) || {}
      configs.deep_symbolize_keys
    end
  end
end
