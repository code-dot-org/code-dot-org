require pegasus_dir 'forms/hoc_signup_2014'

class HocSignup2017 < HocSignup2014
  def self.normalize(data)
    result = super
    result[:nces_school_s] = data[:nces_school_s]
    result[:school_name_s] = data[:school_name_s]

    result
  end

  def self.receipt
    if %w(co la pe).include? @country
      'hoc_signup_2017_receipt_es'
    elsif @country == "br"
      'hoc_signup_2017_receipt_br'
    else
      'hoc_signup_2017_receipt_en'
    end
  end
end
