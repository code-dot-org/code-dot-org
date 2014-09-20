class HelpUs2013

  def self.normalize(data)
    result = {}
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = nil_if_empty stripped data[:name_s]

    location = data[:zip_code_s].to_s.strip
    zip_code = zip_code_from_code(location)
    if zip_code
      result[:zip_code_s] = location
      result[:state_code_s] = zip_code[:state_code_s].downcase
      result[:country_s] = nil_if_empty downcased 'United States'
    else
      result[:zip_code_s] = nil
      result[:state_code_s] = nil
      result[:country_s] = nil_if_empty downcased data[:country_s].to_s
    end

    result[:time_s] = nil_if_empty downcased data[:time_s]
    result[:locations_ss] = nil_if_empty data[:locations_ss]
    result[:languages_ss] = nil_if_empty data[:languages_ss]

    result
  end

end
