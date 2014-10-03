require 'geocoder'

module Geocoder
  module Result
    class Base
      def to_solr(prefix='location_')
        {}.tap do |results|
          results['location_p'] = "#{latitude},#{longitude}" if latitude && longitude
          ['city', 'state', 'country', 'postal_code'].each do |component_name|
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
  config = {
    cache: Hash.new,
    timeout: 10,
    units: :km,
  }

  client_id = CDO.google_maps_client_id
  secret = CDO.google_maps_secret
  if client_id && secret
    config[:lookup] = :google_premier
    config[:api_key] = [secret,client_id,'pegasus']
  end

  config
end
Geocoder.configure(geocoder_config)
