require 'request_store'

module Cdo
  # Lazily loads global configurations for regional pages
  module GlobalEdition
    # Retrieves a list a global region names.
    REGIONS = Dir.glob('*.yml', base: CDO.dir('config', 'global_editions')).map {|f| File.basename(f, '.yml')}.freeze

    TARGET_HOSTNAMES = Set[
      CDO.dashboard_hostname,
    ].freeze

    # Freezes an entire complex data structure
    def self.deep_freeze(data)
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

    # Returns the parsed configuration for the given region.
    def self.load_config(region)
      raise ArgumentError, "Region #{region} is not available" unless region_available?(region)
      config = YAML.load_file(CDO.dir('config', 'global_editions', "#{region}.yml")) || {}
      deep_freeze(config.deep_symbolize_keys)
    end

    def self.target_host?(hostname)
      TARGET_HOSTNAMES.include?(hostname)
    end

    def self.region_available?(region)
      region.present? && REGIONS.include?(region.to_s)
    end

    def self.current_region
      RequestStore.store[:ge_region]
    end

    def self.region_locale(region)
      configuration_for(region)[:locale]
    end
  end
end
