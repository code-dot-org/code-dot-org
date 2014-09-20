class HocHardwarePrizes2014

  def self.normalize(data)
    result = {}
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = required stripped data[:name_s]
    result[:school_name_s] = required stripped data[:school_name_s]
    result[:school_address_s] = stripped data[:school_address_s]
    result[:school_type_s] = required enum(data[:school_type_s].to_s.strip.downcase, ['elementary', 'middle_school', 'high_school'])
    result[:qualifying_school_b] = required stripped data[:qualifying_school_b]
    result[:number_students_i] = required data[:number_students_i]

    if FormError.detect_errors(result).empty?
      result[:logistics_plan_path_s] = required uploaded_file data[:logistics_plan]
    end

    result
  end

  def self.receipt()
  end

  def self.process(data)
    result = {}
    result['location_p'] = geocode_address(data['school_address_s']) unless data['school_address_s'].nil_or_empty?
    result
  end

  def self.solr_query(params)
    query = '*:*'

    fq = []
    fq.push("kind_s:HocHardwarePrizes2014")

    {
      q:query,
      fq:fq,
      rows:rows,
    }
  end
end
