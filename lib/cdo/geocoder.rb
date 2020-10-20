require 'geocoder'
require 'geocoder/results/mapbox'
require 'redis'

module Geocoder
  module Result
    class Base
      def summarize(prefix='location_')
        {}.tap do |results|
          results['location_p'] = "#{latitude},#{longitude}" if latitude && longitude
          %w(street_number route street_address city state state_code country country_code postal_code).each do |component_name|
            component = send component_name
            results["#{prefix}#{component_name}_s"] = component unless component.nil_or_empty?
          end
        end
      end

      def relevance
        1.0
      end
    end

    # This override for the Mapbox class is being added because we are transition from call the Google Maps location
    # services to the Mapbox location services. Unfortunately, the data from Mapbox service is significantly different
    # than the Google responses. In order for our existing code to keep working, this adapter will alter the Mapbox
    # to give data in the same format as the Google response.
    # The long term fix would be to add our own API wrapper for Geocoder responses and then refactor the rest of the
    # codebase to depend on that API instead of directly on the Google/Mapbox API. However, we need this adapter patch
    # quickly before the Google Maps API is turned off for us.
    module CdoResultAdapter
      def state_code
        # e.g. 'US-WA', 'GB-ENG'
        country_state_code = mapbox_context('region')&.[]('short_code')
        # The state code comes after the '-'
        country_state_code&.split('-')&.last&.upcase
      end

      def country_code
        # The Mapbox result parser in the Geocoder gem doesn't extract the country code direct searches of a country
        # so we will extract the country code ourselves.
        if @data['place_type'] == ['country']
          return @data['properties']&.[]('short_code')&.upcase
        end
        mapbox_context('country')&.[]('short_code')&.upcase
      end

      def street_number
        data['address']
      end

      def route
        data['text']
      end

      def street_address
        "#{data['address']} #{data['text']}".strip
      end

      def address
        data['place_name']
      end

      def formatted_address
        data['place_name']
      end

      def relevance
        data['relevance']
      end

      # This following methods should be removed once the Geocoder gem is updated
      # https://github.com/code-dot-org/code-dot-org/pull/37192/files
      def city
        mapbox_context('place')&.[]('text')
      end

      def state
        mapbox_context('region')&.[]('text')
      end

      def postal_code
        mapbox_context('postcode')&.[]('text')
      end

      def country
        mapbox_context('country')&.[]('text')
      end

      def neighborhood
        mapbox_context('neighborhood')&.[]('text')
      end

      private

      def mapbox_context(name)
        context.map do |c|
          c if c['id'] =~ Regexp.new(name)
        end&.compact&.first
      end

      # This should removed once the Geocoder gem is updated
      # https://github.com/code-dot-org/code-dot-org/pull/37192/files
      def context
        Array(data['context'])
      end
    end
    Mapbox.send :prepend, CdoResultAdapter
  end

  MIN_ADDRESS_LENGTH = 10

  def self.find_potential_street_address(text)
    return nil unless text

    # Starting from the first number in the string, try parsing with Geocoder
    number_to_end_search = text.scan /([0-9]+.*)/
    return nil if number_to_end_search.empty?

    first_number_to_end = number_to_end_search.first.first

    return nil if Float(first_number_to_end) rescue false # is a number
    return nil if first_number_to_end.length < MIN_ADDRESS_LENGTH # too short to be an address

    results = Geocoder.search(first_number_to_end)
    return nil if results.empty?

    # Return nil if none of the results returned from Geocoder matched on a
    # street address with relevance >= 0.8
    return nil if results.none? {|r| r.relevance >= 0.8 && r.street_address}

    first_number_to_end
  end

  # Temporarily, for a given block, configure Geocoder to raise all errors.
  # Normally Geocoder swallows errors. There is no way to tell if an empty result
  # is a successful query for a nonexistent location, or a failed query.
  # See https://github.com/alexreisner/geocoder#error-handling
  # @yield [] block to execute with raising errors enabled
  def self.with_errors
    previous_always_raise_configuration = Geocoder::Configuration.instance.data[:always_raise]
    begin
      Geocoder.configure(always_raise: :all)
      yield
    ensure
      Geocoder.configure(always_raise: previous_always_raise_configuration)
    end
  end

  # Override Geocoder#search to ensure all queries for Sauce Labs IP addresses resolve to the United States.
  module SauceLabsOverride
    # Ref: https://support.saucelabs.com/hc/en-us/articles/115003359593-IP-Blocks-Used-by-Sauce-Labs-Services
    SAUCELABS_CIDR = [
      IPAddr.new('162.222.72.0/21'),
      IPAddr.new('66.85.48.0/21')
    ]

    def search(query, options = {})
      ip = IPAddr.new(query) rescue nil
      if SAUCELABS_CIDR.any? {|cidr| cidr.include?(ip)}
        [OpenStruct.new(country_code: 'US', country: 'United States')]
      else
        super
      end
    end
  end
  singleton_class.prepend SauceLabsOverride
end

def geocoder_config
  {
    cache: Hash.new,
    timeout: 10,
    units: :km,
  }.tap do |config|
    config[:cache] = Redis.connect(url: CDO.geocoder_redis_url) if CDO.geocoder_redis_url
    if CDO.mapbox_access_token
      config[:lookup] = :mapbox
      config[:use_https] = true
      config[:api_key] = CDO.mapbox_access_token
    end
    config[:freegeoip] = {host: CDO.freegeoip_host} if CDO.freegeoip_host
  end
end

Geocoder.configure(geocoder_config)
