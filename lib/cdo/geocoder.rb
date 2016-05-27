require 'geocoder'
require 'redis'

module Geocoder

  module Result
    class Base
      def to_solr(prefix='location_')
        {}.tap do |results|
          results['location_p'] = "#{latitude},#{longitude}" if latitude && longitude
          %w(street_number route street_address city state state_code country country_code postal_code).each do |component_name|
            component = self.send component_name
            results["#{prefix}#{component_name}_s"] = component unless component.nil_or_empty?
          end
        end
      end
    end
  end

  def self.find_potential_street_address(text)
    # Starting from the first number in the string, try parsing with Geocoder
    number_to_end_search = text.scan /([0-9]+.*)/
    return nil if number_to_end_search.empty?

    first_number_to_end = number_to_end_search.first.first

    return nil if Float(first_number_to_end) rescue false # is a number
    return nil if first_number_to_end.length <= 6 # too short to be an address

    results = Geocoder.search(first_number_to_end)
    return nil if results.empty?

    if results.first.types.include?('street_address')
      return first_number_to_end
    end
    nil
  end
end

module ReplaceFreegeoipHostModule

  def self.included base
    base.class_eval do

      def query_url(query)
        "#{protocol}://#{CDO.freegeoip_host}/json/#{query.sanitized_text}"
      end

    end
  end

end
Geocoder::Lookup::Freegeoip.send(:include,ReplaceFreegeoipHostModule) if CDO.freegeoip_host

def geocoder_config
  {
    cache: Hash.new,
    timeout: 10,
    units: :km,
  }.tap do |config|
    config[:cache] = Redis.connect(url: CDO.geocoder_redis_url) if CDO.geocoder_redis_url

    if CDO.google_maps_client_id && CDO.google_maps_secret
      config[:lookup] = :google_premier
      config[:api_key] = [CDO.google_maps_secret, CDO.google_maps_client_id, 'pegasus']
    end
  end
end

Geocoder.configure(geocoder_config)
