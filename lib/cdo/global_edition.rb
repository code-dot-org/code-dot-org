# frozen_string_literal: true

require 'i18n'
require 'request_store'
require 'uri'

require 'cdo'
require 'cdo/yaml'
require 'cdo/i18n'

module Cdo
  # Lazily loads global configurations for regional pages
  module GlobalEdition
    REGION_KEY = 'ge_region'

    DEFAULT_REGION = 'us'
    DEFAULT_LOCALE = Cdo::I18n::DEFAULT_LOCALE

    REGIONS = Dir.glob('*.yml', base: CDO.dir('config', 'global_editions')).to_set {|f| File.basename(f, '.yml')}.freeze

    REGION_CONFIGS = REGIONS.each_with_object({}) do |region, configs|
      configs[region] = YAML.safe_load_file(
        CDO.dir('config', 'global_editions', "#{region}.yml"), aliases: true
      ).deep_symbolize_keys.freeze
    end.freeze

    # @return [Hash{String => Set<String>}] Locales available for each region.
    REGION_LOCALES = begin
      region_locales = REGIONS.each_with_object({}) do |region, result|
        result[region] = (REGION_CONFIGS.dig(region.to_s, :locales) || []).to_set
      end

      configured_locales   = region_locales.values.reduce(Set.new, &:|)
      unconfigured_locales = Cdo::I18n.available_languages_by_locale.keys.to_set - configured_locales
      region_locales[DEFAULT_REGION] = Set[DEFAULT_LOCALE, *region_locales[DEFAULT_REGION], *unconfigured_locales]

      region_locales.each do |region, locales|
        next unless locales.empty?
        warn <<~MSG
          [WARNING] Global Edition region #{region.inspect} has no configured locales.
          Add `locales` to `config/global_editions/#{region}.yml` or remove the region.
        MSG
      end

      region_locales.freeze
    end

    # @return [Hash{String => String}] First configured region for each locale.
    REGION_BY_LOCALE = REGION_LOCALES.each_with_object({}) do |(region, locales), region_by_locale|
      locales.each do |locale|
        if region_by_locale[locale]
          warn <<~MSG
            [WARNING] Global Edition locale "#{locale}" is configured for multiple regions.
            Ignoring region "#{region}" because the locale is already configured for region "#{region_by_locale[locale]}".
          MSG
        else
          region_by_locale[locale] = region
        end
      end
    end.freeze

    # HTTP path prefixes to be excluded from Global Edition scope.
    EXCLUDED_PATHS = Set[
      '/assets/',
      '/shared/',
      # Exclude HoC legacy API routes from Global Edition scope.
      '/api/hour/',
      # To make an OAuth callback accessible, it must be added to the whitelist of each SSO provider.
      # Instead of repeating this process for each new Global Edition region,
      # it is more efficient to remove the Global Edition prefix and treat the request as a standard route.
      # Additionally, preventing OAuth routes from being redirected, ensuring the authentication process is not disrupted.
      '/users/auth/',
      # Exclude LTI routes.
      '/lti/',
      # Exclude music files.
      '/restricted/',
      # Exclude health check routes.
      '/health_check',
      '/home/health_check'
    ].freeze

    # Extends Rails URL path generation to automatically prefix generated paths with the current GE region path.
    #
    # @see https://github.com/rails/rails/blob/v7.0.10/actionpack/lib/action_dispatch/http/url.rb#L70-L80
    #
    # @example
    #   Cdo::GlobalEdition.current_region = 'in'
    #   I18n.locale = 'hi-IN'
    #
    #   Rails.application.routes.url_helpers.home_path => '/in/hi/home'
    #   Rails.application.routes.url_helpers.home_url => 'https://studio.code.org/in/hi/home'
    module URL
      def path_for(...)
        path = super

        ge_region = Cdo::GlobalEdition.current_region
        path = Cdo::GlobalEdition.path(ge_region, path) if ge_region

        path
      end
    end

    def self.region_available?(region)
      (DCDO.get('global_edition_enabled_regions', REGIONS) || REGIONS).include?(region.to_s)
    end

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

    def self.region_config(region, *keys)
      configuration_for(region_available?(region) ? region : DEFAULT_REGION).dig(*keys)
    end

    # @return [NilClass, Array<String>] List of project types available in the given region.
    # @note +nil+ means all projects are available.
    def self.region_project_types(region)
      configuration_for(region)[:project_types]
    end

    def self.locale_region(locale)
      REGION_BY_LOCALE[locale.to_s]
    end

    def self.region_locales(region)
      REGION_LOCALES[region.to_s] || Set[]
    end

    def self.main_region_locale(region)
      region_locales(region).first
    end

    def self.locale_available?(region, locale)
      region_locales(region).include?(locale)
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
      region_locales(region).find {_1.start_with?(url_locale_segment)}
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
      locale.to_s.split('-').first
    end

    # Returns the URL locale segments available for regions that support multiple locales.
    #
    # Only regions with more than one configured locale are included, since regions
    # with a single locale do not need a locale segment in the URL path. Each locale
    # is converted to its URL form, such as "hi-IN" => "hi".
    #
    # @return [Hash{String => Set<String>}] A hash that maps each region code to
    #   the list of locale segments used in URL paths.
    #
    # @example regions_url_locales => { "in" => Set["en", "hi"] }
    def self.regions_url_locales
      @regions_url_locales ||= REGIONS.each_with_object({}) do |region, regions_url_locales|
        region_locales = region_locales(region)
        next if region_locales.size <= 1
        regions_url_locales[region] = region_locales.to_set {url_locale_segment(_1)}.freeze
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
      path_pattern.match(path.to_s)
    end

    # Checks whether the given path starts with one of the excluded path prefixes.
    #
    # @param path [String] the path to check
    # @return [Boolean] true if the path matches an excluded prefix, false otherwise
    def self.excluded_path?(path)
      path.to_s.start_with?(*EXCLUDED_PATHS)
    end

    # Returns the URL path prefix for the given Global Edition region and locale.
    #
    # The default region and locale have no prefix.
    # Regions with multiple URL locales include both the region and locale segments.
    # When the locale is not available for such a region, the region's main locale is used instead.
    # Regions without URL locales use only the region segment.
    #
    # @param region [String, nil] The Global Edition region code. Defaults to the current region.
    # @param locale [String] The locale used when the region has URL locale segments. Defaults to `I18n.locale`.
    # @return [String] The path prefix, or an empty string for the default region and locale.
    #
    # @example No prefix for the default region and locale
    #   path_prefix(DEFAULT_REGION, DEFAULT_LOCALE) => ""
    #
    # @example Prefix a region with URL locale segments
    #   path_prefix("in", "hi-IN") => "/in/hi"
    #
    # @example Prefix a region without URL locale segments
    #   path_prefix("fa") => "/fa"
    def self.path_prefix(region = current_region, locale = ::I18n.locale.to_s)
      return '' unless region

      if region == DEFAULT_REGION && locale == DEFAULT_LOCALE
        ''
      elsif regions_url_locales[region]
        locale = main_region_locale(region) unless locale_available?(region, locale)
        "/#{region}/#{url_locale_segment(locale)}"
      else
        "/#{region}"
      end
    end

    # Builds a URL path scoped to the given Global Edition region.
    #
    # If the path already includes a supported Global Edition prefix, that prefix
    # is removed before the new regional path is built. Excluded paths, such as
    # assets and OAuth callback paths, are returned without a Global Edition prefix.
    #
    # For regions that support multiple URL locales, the result includes both the
    # region and locale segments, such as `/in/hi/home`. For regions without URL
    # locale segments, the result includes only the region segment, such as
    # `/fa/home`. When no locale is provided for a multi-locale region, the current
    # `I18n.locale` is used. If that locale is not available for the region, the
    # region's main locale is used instead.
    #
    # @param region [String] The Global Edition region code, for example "in".
    # @param path [String] The URL path to prefix. Use a leading slash, or an empty
    #   string to return only the region prefix.
    # @param locale [String, nil] The locale to use for regions with URL locale
    #   segments. Defaults to `I18n.locale`.
    # @return [String] The normalized URL path for the given region.
    #
    # @example Build a path for a region with a locale segment
    #   path("in", "/home", locale: "hi-IN") => "/in/hi/home"
    #
    # @example Build a path for a region without a locale segment
    #   path("fa", "/home") => "/fa/home"
    #
    # @example Replace an existing Global Edition prefix
    #   path("fa", "/in/hi/home") => "/fa/home"
    #
    # @example Return an excluded path without a Global Edition prefix
    #   path("fa", "/shared/logo.png") => "/shared/logo.png"
    def self.path(region, path = '', locale: ::I18n.locale.to_s)
      path = unprefixed_path(path)
      return path if excluded_path?(path)

      "#{path_prefix(region, locale)}#{path}"
    end

    # Returns the path without the Global Edition prefix.
    #
    # @param path [String] The URL path to remove the Global Edition prefix from.
    # @return [String] The URL path without the Global Edition prefix.
    #
    # @example
    #   unprefixed_path("/in/hi/home") => "/home"
    def self.unprefixed_path(path)
      match_path(path)&.try(:[], :main_path) || path
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

ActionDispatch::Http::URL.singleton_class.prepend(Cdo::GlobalEdition::URL) if defined?(ActionDispatch::Http::URL)
