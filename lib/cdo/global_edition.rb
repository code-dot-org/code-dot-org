# frozen_string_literal: true

require 'request_store'
require 'uri'
require 'yaml'

module Cdo
  # Lazily loads global configurations for regional pages
  module GlobalEdition
    REGION_KEY = 'ge_region'

    # Retrieves a list a global region names.
    REGIONS = Dir.glob('*.yml', base: CDO.dir('config', 'global_editions')).map {|f| File.basename(f, '.yml')}.freeze

    TARGET_HOSTNAMES = Set[
      CDO.dashboard_hostname,
      CDO.pegasus_hostname,
    ].freeze

    # @see +Rack::GlobalEdition::RouteHandler#response+
    def self.current_region
      RequestStore.store[REGION_KEY]
    end

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
      @@configurations[region.to_s] ||= load_config(region) || {}
    end

    # Returns the parsed configuration for the given region.
    def self.load_config(region)
      return unless region_available?(region)
      config = YAML.load_file(CDO.dir('config', 'global_editions', "#{region}.yml")) || {}
      deep_freeze(config.deep_symbolize_keys)
    end

    def self.target_host?(hostname)
      TARGET_HOSTNAMES.include?(hostname)
    end

    def self.region_available?(region)
      region.present? && REGIONS.include?(region.to_s)
    end

    def self.region_locales(region)
      configuration_for(region)&.dig(:locales)
    end

    def self.main_region_locale(region)
      region_locales(region)&.first
    end

    def self.locale_lock?(region)
      configuration_for(region)&.dig(:locale_lock)
    end

    def self.region_locked_locales
      @region_locked_locales ||= begin
        region_locked_locales = {}
        REGIONS.each do |region|
          next unless locale_lock?(region)
          locale = main_region_locale(region)
          region_locked_locales[locale] = region
        end
        region_locked_locales
      end.freeze
    end

    def self.region_change_url(url, region = nil)
      uri = URI.parse(url)

      params = URI.decode_www_form(uri.query.to_s).to_h
      params[REGION_KEY] = region
      uri.query = URI.encode_www_form(params)

      uri.to_s
    end
  end
end
