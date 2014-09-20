class BringToSchool2013

  def self.normalize(data)
    result = {}
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = nil_if_empty stripped data[:name_s]
    result[:school_s] = nil_if_empty stripped data[:school_s]
    result[:role_s] = nil_if_empty downcased stripped data[:role_s]
    result[:grades_ss] = nil_if_empty (data[:grades_ss]||[]).map{|i| i.downcase}
    result[:size_s] = nil_if_empty stripped data[:size_s]
    result[:labs_s] = nil_if_empty downcased stripped data[:labs_s]
    result[:internet_s] = nil_if_empty downcased stripped data[:internet_s]
    result[:interests_ss] = nil_if_empty (data[:interests_ss]||[]).map{|i| i.downcase}

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

    result
  end

end
