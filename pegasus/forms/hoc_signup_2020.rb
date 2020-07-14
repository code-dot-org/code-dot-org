require pegasus_dir 'forms/hoc_signup_2017'

#HOC Sign up form for 2020. 2017 was the last form with new logic
class HocSignup2020 < HocSignup2017
  def self.receipt(data)
    country = data["hoc_event_country_s"].downcase unless data["hoc_event_country_s"].nil_or_empty?
    if %w(ar bo cl co cr cu do ec gq gt hn mx ni pa pe pr py sv uy ve).include? country
      'hoc_signup_2020_receipt_es'
    elsif country == "br"
      'hoc_signup_2020_receipt_pt'
    else
      'hoc_signup_2020_receipt_en'
    end
  end
end
