require 'geocoder'
require 'redis'

module Geocoder
  module Result
    class Base
      def summarize(prefix='location_')
        {}.tap do |results|
          results["#{prefix}street_number_s"] = data['address']
          results["#{prefix}route_s"] = data['text']
          results["#{prefix}street_address_s"] = "#{data['address']} #{data['text']}".strip
          results["#{prefix}city_s"] = city
          results["#{prefix}state_s"] = state
          results["#{prefix}state_code_s"] = context_state_code
          results["#{prefix}country_s"] = country
          results["#{prefix}country_code_s"] = context_country_code
          results["#{prefix}postal_code_s"] = postal_code

          results['location_p'] = "#{latitude},#{longitude}" if latitude && longitude
          %w(address city state postal_code country).each do |component_name|
            component = send component_name
            results["#{prefix}#{component_name}_s"] = component unless component.nil_or_empty?
          end
        end
      end

      private

      def mapbox_context(name)
        data['context'].map do |c|
          c if c['id'] =~ Regexp.new(name)
        end&.compact&.first
      end

      def mapbox_state_code
        # e.g. 'US-WA', 'GB-ENG'
        country_state_code = mapbox_context('region')&.[]('short_code')
        # The state code comes after the '-'
        country_state_code&.split('-')&.last&.upcase
      end

      def mapbox_country_code
        mapbox_context('country')&.[]('short_code')&.upcase
      end
    end
  end

  MIN_ADDRESS_LENGTH = 10

  def self.find_potential_street_address(text)
    # Starting from the first number in the string, try parsing with Geocoder
    number_to_end_search = text.scan /([0-9]+.*)/
    return nil if number_to_end_search.empty?

    first_number_to_end = number_to_end_search.first.first

    return nil if Float(first_number_to_end) rescue false # is a number
    return nil if first_number_to_end.length < MIN_ADDRESS_LENGTH # too short to be an address

    results = Geocoder.search(first_number_to_end)
    return nil if results.empty?

    if results.first.address
      return first_number_to_end
    end
    nil
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
