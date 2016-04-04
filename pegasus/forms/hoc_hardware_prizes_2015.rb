require pegasus_dir 'forms/hoc_hardware_prizes_2014'

class HocHardwarePrizes2015 < HocHardwarePrizes2014
  def self.normalize(data)
    result = {}
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = required stripped data[:name_s]
    result[:school_name_s] = required stripped data[:school_name_s]
    result[:school_address_s] = required stripped data[:school_address_s]
    result[:school_type_s] = required enum(data[:school_type_s].to_s.strip.downcase, %w(elementary middle_school high_school))
    result[:qualifying_school_b] = required stripped data[:qualifying_school_b]
    result[:title_I_school_b] = nil_if_empty stripped data[:title_I_school_b]
    result[:number_students_s] = required integer data[:number_students_s]
    result[:technology_plan_s] = required stripped data[:technology_plan_s]

    if FormError.detect_errors(result).empty?
      result[:logistics_plan_path_s] = required uploaded_file data[:logistics_plan]
    end

    result
  end

  def self.receipt()
    'hoc_hardware_prizes_2015_receipt'
  end
end
