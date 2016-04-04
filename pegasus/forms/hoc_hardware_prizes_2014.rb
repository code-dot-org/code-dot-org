class HocHardwarePrizes2014

  def self.normalize(data)
    result = {}
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = required stripped data[:name_s]
    result[:school_name_s] = required stripped data[:school_name_s]
    result[:school_address_s] = required stripped data[:school_address_s]
    result[:school_type_s] = required enum(data[:school_type_s].to_s.strip.downcase, %w(elementary middle_school high_school))
    result[:qualifying_school_b] = required stripped data[:qualifying_school_b]
    result[:number_students_s] = required data[:number_students_s]

    if FormError.detect_errors(result).empty?
      result[:logistics_plan_path_s] = required uploaded_file data[:logistics_plan]
    end

    result
  end

  def self.receipt()
  end

  def self.process(data)
    {}.tap do |results|
      location = search_for_address(data['school_address_s']) unless data['school_address_s'].nil_or_empty?
      results.merge! location.to_solr('school_') if location
    end
  end
end
