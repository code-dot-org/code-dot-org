require pegasus_dir 'forms/hoc_signup_2017'

class HocSignup2018 < HocSignup2017
  def self.receipt(data)
    country = data["hoc_event_country_s"].downcase unless data["hoc_event_country_s"].nil_or_empty?
    if %w(co la pe).include? @country
      'hoc_signup_2018_receipt_es'
    elsif country == "br"
      'hoc_signup_2018_receipt_pt'
    else
      'hoc_signup_2018_receipt_en'
    end
  end
end
