# frozen_string_literal: true

require 'request_store'
require 'uri'
require 'i18n'
require 'cdo/yaml'
require 'cdo/git_utils' # Necessary for 'test' environment to load test.erb.yml
require 'cdo'
require 'cdo/i18n'

module Cdo
  # Lazily loads global configurations for regional pages
  module GlobalEdition
    REGION_KEY = 'ge_region'

    REGIONS = Dir.glob('*.yml', base: CDO.dir('config', 'global_editions')).map {|f| File.basename(f, '.yml')}.freeze
    REGION_CONFIGS = REGIONS.each_with_object({}) do |region, configs|
      configs[region] = YAML.safe_load_file(CDO.dir('config', 'global_editions', "#{region}.yml"), aliases: true)&.deep_symbolize_keys || {}
    end.freeze

    TARGET_HOSTNAMES = Set[
      CDO.dashboard_hostname,
    ].freeze

    # @see `Middleware::GlobalEdition::RouteHandler#setup_region`
    def self.current_region=(region)
      if region.nil?
        RequestStore.store.delete(REGION_KEY)
      elsif region_available?(region)
        RequestStore.store[REGION_KEY] = region
      end
    end

    # @see `Middleware::GlobalEdition::RouteHandler#setup_region`
    def self.current_region
      RequestStore.store[REGION_KEY]
    end

    def self.configuration_for(region)
      REGION_CONFIGS[region.to_s] || {}
    end

    def self.target_host?(hostname)
      TARGET_HOSTNAMES.include?(hostname)
    end

    # Resolves the full I18n locale for a region from a locale value extracted from the request path.
    #
    # Path locale values may use a shortened form such as "hi", while configured
    # region locales may use full locale codes such as "hi-IN". This method searches
    # the locales available for the given region and returns the first locale that
    # starts with the path locale value.
    #
    # @param region [String] The Global Edition region code, for example "in".
    # @param path_locale [String] The locale value extracted from the request path, for example "hi".
    # @return [String, nil] The matching full I18n locale for the region, or `nil` if no matching locale is found.
    #
    # @example Resolve a full locale from a path locale value
    #   resolve_region_locale("in", "hi") => "hi-IN"
    #
    # @example Return nil when the region has no matching locale
    #   resolve_region_locale("fa", "es") => nil
    def self.resolve_region_locale(region, url_locale_segment)
      region_locales(region)&.find {_1.start_with?(url_locale_segment)}
    end

    # Returns the locale segment used in the URL path for the given locale.
    #
    # Global Edition paths may use a shortened locale segment such as "hi" instead
    # of a full I18n locale code such as "hi-IN". This method extracts that URL
    # locale segment from the given locale.
    #
    # @param locale [String] The full locale code, for example "hi-IN"
    # @return [String] The locale segment used in the URL path, for example "hi"
    #
    # @example Extract the URL locale segment from a full locale
    #   url_locale_segment("hi-IN") > "hi"
    def self.url_locale_segment(locale)
      locale.split('-').first
    end

    # Returns the URL locale segments available for regions that support multiple locales.
    #
    # Only regions with more than one configured locale are included, since regions
    # with a single locale do not need a locale segment in the URL path. Each locale
    # is converted to its URL form, such as "hi-IN" => "hi".
    #
    # @return [Hash{String => Array<String>}] A hash that maps each region code to
    #   the list of locale segments used in URL paths.
    #
    # @example regions_url_locales => { "in" => ["en", "hi"] }
    def self.regions_url_locales
      @regions_url_locales ||= REGIONS.each_with_object({}) do |region, regions_url_locales|
        region_locales = region_locales(region) || []
        next if region_locales.size <= 1

        regions_url_locales[region] = region_locales.map {|locale| url_locale_segment(locale)}
      end.freeze
    end

    # Regexes that match supported Global Edition path formats.
    #
    # The pattern matches:
    # - paths with a region only, such as `/fa/home`
    # - paths with both a region and a locale segment, such as `/in/hi/home`
    #
    # Named captures:
    # - `region` for the Global Edition region code
    # - `locale` for the optional locale segment
    # - `main_path` for the remaining path, including the leading `/`, or an empty string
    #
    # @return [Regexp] A regular expression for matching and extracting Global Edition path components
    def self.path_pattern
      @path_pattern ||= Regexp.union(
        # Match paths that include only a region segment, such as `/fa/*`.
        %r{^/(?<region>#{(REGIONS - regions_url_locales.keys).join('|')})(?<main_path>/.*|$)},
        # Match paths that include both a region and a locale segment, such as `/in/hi/*`.
        *regions_url_locales.map do |region, path_locales|
          %r{^/(?<region>#{region})/(?<locale>#{path_locales.join('|')})(?<main_path>/.*|$)}
        end
      ).freeze
    end

    # Matches a valid Global Edition path and returns the captured path segments.
    #
    # The returned match data is produced by `path_pattern` and may include the
    # named captures `region`, `locale`, and `main_path`.
    #
    # @param path [String] The request path to match
    # @return [MatchData, nil] The match data for the path, or `nil` if the path
    #   does not match a supported Global Edition path format.
    #
    # @example Match a path with a region only
    #   match = match_path('/fa/home')
    #   match[:region]    => 'fa'
    #   match[:locale]    => nil
    #   match[:main_path] => '/home'
    #
    # @example Match a path with both region and locale
    #   match = match_path('/in/hi/home')
    #   match[:region]    => 'in'
    #   match[:locale]    => 'hi'
    #   match[:main_path] => '/home'
    #
    # @example Return nil for a non Global Edition path
    #   match_path('/home') => nil
    def self.match_path(path)
      path_pattern.match(path)
    end

    # Builds a Global Edition path for the given region and path components.
    #
    # If the joined path already includes a supported Global Edition prefix, that
    # prefix is removed before the new regional path is built. For regions that
    # support multiple URL locales, the resulting path includes both the region and
    # locale segments, such as `/in/hi/home`. For regions with a single locale, the
    # resulting path includes only the region segment, such as `/fa/home`.
    #
    # When no locale is provided for a multi locale region, the current `I18n.locale`
    # is used. If that locale is not available for the region, the region's main
    # locale is used instead.
    #
    # @param region [String] The Global Edition region code, for example "in".
    # @param paths [Array<String>] One or more path components to join.
    # @param locale [String, nil] The locale to use for regions with locale segments in the URL path. Defaults to `I18n.locale`.
    # @return [String] The normalized Global Edition path for the given region.
    #
    # @example Build a path for a region with a locale segment
    #   path("in", "home", locale: "hi-IN") => "/in/hi/home"
    #
    # @example Build a path for a region without a locale segment
    #   path("fa", "home") => "/fa/home"
    #
    # @example Replace an existing Global Edition prefix
    #   path("fa", "/in/hi/home") => "/fa/home"
    def self.path(region, *paths, locale: ::I18n.locale)
      region = region.to_s

      path = ::File.join('/', *paths)
      path = match_path(path)&.try(:[], :main_path) || path

      if regions_url_locales[region]
        locale = main_region_locale(region) unless locale_available?(region, locale)
        path = ::File.join('/', region, url_locale_segment(locale), path)
      else
        path = ::File.join('/', region, path)
      end

      path
    end

    def self.region_available?(region)
      region.present? && REGIONS.include?(region.to_s)
    end

    def self.region_locales(region)
      configuration_for(region)[:locales] || []
    end

    # @return [NilClass, Array<String>] List of project types available in the given region.
    # @note +nil+ means all projects are available.
    def self.region_project_types(region)
      configuration_for(region)[:project_types]
    end

    def self.main_region_locale(region)
      region_locales(region).first
    end

    def self.locale_available?(region, locale)
      region_locales(region).include?(locale)
    end

    def self.locale_lock?(region)
      !!configuration_for(region)[:locale_lock]
    end

    def self.locales_regions
      @locales_regions ||= REGIONS.each_with_object({}) do |region, locales_regions|
        next unless region_available?(region) && locale_lock?(region)
        region_locales(region).each do |region_locale|
          locales_regions[region_locale] ||= []
          locales_regions[region_locale] << region
        end
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
  end
end
