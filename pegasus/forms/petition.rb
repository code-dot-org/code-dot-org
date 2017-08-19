require 'cdo/geocoder'
require_relative './form'

class Petition < Form
  def self.normalize(data)
    result = {}
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = nil_if_empty stripped data[:name_s]

    age = data[:age_i].to_i
    data[:age_i] = (age == 0) ? nil : age
    result[:age_i] = required data[:age_i]

    # Though this should have been done client-side, we do this server-side
    # for redundancy.
    if age < 13
      result[:email_s] = 'anonymous@code.org' unless result[:email_s].class == FieldError
      result[:name_s] = nil unless result[:name_s].class == FieldError
    end

    result.merge! get_location(data[:zip_code_or_country_s].to_s.strip)

    role = default_if_empty downcased(stripped(data[:role_s])), 'other'
    result[:role_s] = enum role, %w(student parent educator engineer other)

    result
  end

  def self.process(data)
    result = {}

    location = data['zip_code_s'] || data['country_s']
    begin
      result['location_p'] = geocode_address(location) unless location.nil_or_empty?
    rescue
    end

    result
  end

  def self.receipt
    'petition_receipt'
  end

  # @params zip_code_or_country [String] a five digit US zip code or country
  #   name.
  # @returns [Hash] data about zip_code_or_country.
  def self.get_location(zip_code_or_country)
    # Note that, empirically, we see non-US zip codes so we check for
    # numerality and length.
    unless /^\d{5}$/ =~ zip_code_or_country
      return {country_s: zip_code_or_country}
    end

    # Attempt to geocode the (presumed) US zip code. If successful, return the
    # data.
    result = {zip_code_s: zip_code_or_country}
    location = Geocoder.search(zip_code_or_country).first
    if location
      location.data['address_components'].each do |component|
        if component['types'].include? 'administrative_area_level_1'
          result['state_code_s'] = component['short_name'].downcase
        end
        if component['types'].include? 'country'
          result['country_s'] = component['long_name'].downcase
        end
      end
      return result if result['country_s'] == 'united states'
    end

    # The zip code was not a US zip code, return the user input.
    {country_s: zip_code_or_country}
  end
end
