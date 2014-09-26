class Petition

  def self.normalize(data)
    result = {}
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = nil_if_empty stripped data[:name_s]

    age = data[:age_i].to_i
    data[:age_i] = (age == 0) ? nil : age
    result[:age_i] = required data[:age_i]

    if age < 13
      result[:email_s] = 'anonymous@code.org' unless result[:email_s].class == FieldError
      result[:name_s] = nil unless result[:name_s].class == FieldError
    end

    location = data[:zip_code_or_country_s].to_s.strip
    zip_code = zip_code_from_code(location)
    if zip_code
      result[:zip_code_s] = location
      result[:state_code_s] = zip_code[:state_code_s].downcase
      location = 'United States'
    end
    result[:country_s] = nil_if_empty downcased location

    role = default_if_empty downcased(stripped(data[:role_s])), 'other'
    result[:role_s] = enum role, ['student', 'parent', 'educator', 'engineer', 'other']

    result
  end

  def self.process(data, last_processed_data)
    result = {}

    location = data['zip_code_s'] || data['country_s']
    result['location_p'] = geocode_address(location) unless location.nil_or_empty?

    result
  end

  def self.receipt()
    'petition_receipt'
  end

end
