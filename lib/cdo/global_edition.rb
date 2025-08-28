# frozen_string_literal: true

require 'request_store'
require 'uri'
require 'yaml'
require 'cdo/git_utils' # Necessary for 'test' environment to load test.erb.yml
require 'cdo'
require 'cdo/i18n'

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

    # @example Matches paths like `/global/fa/home`, capturing:
    # - ge_prefix: "/global/fa"
    # - ge_region: "fa"
    # - main_path: "/home"
    PATH_PATTERN = Regexp.new <<~REGEXP.gsub(/\s+/, '')
      ^(?<ge_prefix>/(?<ge_region>#{REGIONS.join('|')}))
      (?<main_path>/.*|$)
    REGEXP

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

    # Replaces some string keys in the configuration
    def self.deep_replace(value, dictionary)
      case value
      when String
        dictionary.each do |find, replace|
          value.gsub!(find.to_s, replace)
        end
        value
      when Hash
        # Recursively call deep_replace on each key-value pair in the hash
        value.each {|key, val| value[key] = deep_replace(val, dictionary)}
      when Array
        # Recursively call deep_replace on each element of the array
        value.map {|val| deep_replace(val, dictionary)}
      else
        # Return value as-is if it's neither a String, Hash, nor Array
        value
      end
    end

    # Retrieves the global configuration for the given region.
    def self.configuration_for(region)
      @@configurations ||= {}
      @@configurations[region.to_s] ||= begin
        config = load_config(region) || {}

        # Replace :region tag before freezing
        deep_replace(config, {
                       ':region': region.to_s,
                     }
        )

        deep_freeze(config)
      end
    end

    # Returns the parsed configuration for the given region.
    def self.load_config(region, inheriting = false)
      return unless region_available?(region)
      config = YAML.load_file(CDO.dir('config', 'global_editions', "#{region}.yml")) || {}
      config = config.deep_symbolize_keys

      # If this inherits, load the inherited region too
      # (But only allow one inherit, to avoid loops or misconfigurations)
      if config[:inherit] && !inheriting
        inherited = load_config(config[:inherit], true)

        # Merge
        config = inherited.merge(config)
      end

      config
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

    # @return [NilClass, Array<String>] List of project types available in the given region.
    # @note +nil+ means all projects are available.
    def self.region_project_types(region)
      configuration_for(region)&.dig(:project_types)
    end

    def self.main_region_locale(region)
      locked_locale = configuration_for(region)&.dig(:locale_lock)
      return locked_locale if locked_locale.is_a?(String)
      region_locales(region)&.first
    end

    def self.locale_available?(region, locale)
      return true if region.nil? || region.empty?
      region_locales(region)&.include?(locale)
    end

    def self.locked_locale(region)
      locale_lock = configuration_for(region)&.dig(:locale_lock)
      return locale_lock if locale_lock.is_a?(String)
      nil
    end

    def self.locale_lock?(region)
      !!configuration_for(region)&.dig(:locale_lock)
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

    # @note GET requests do not trigger the region change due to +HttpCache.config+ on Pegasus. Use POST instead.
    def self.region_change_url(url, region = nil)
      uri = URI.parse(url)

      params = URI.decode_www_form(uri.query.to_s).to_h
      params[REGION_KEY] = region
      uri.query = URI.encode_www_form(params)

      uri.to_s
    end

    def self.countries_regions
      @countries_regions ||= REGIONS.each_with_object({}) do |region, countries_regions|
        region_countries = configuration_for(region).fetch(:countries, [])
        region_countries.each {|country| countries_regions[country] = region}
      end
    end

    def self.country_region(country)
      countries_regions[country]
    end

    def self.region_locale_options(region)
      locale_options = Cdo::I18n.locale_options
      return locale_options unless region_available?(region)

      @region_locale_options ||= {}

      @region_locale_options[region] ||= begin
        region_locales = region_locales(region)
        locale_options = locale_options.select {|_name, value| region_locales.include?(value)} if region_locales
        locale_options
      end
    end

    def self.path(region, *paths)
      path = ::File.join('/', *paths)
      path = Cdo::GlobalEdition::PATH_PATTERN.match(path)[:main_path] if Cdo::GlobalEdition::PATH_PATTERN.match?(path)
      ::File.join('/', region, path)
    end
  end
end
