require pegasus_dir 'forms/hoc_signup_2020'

# HOC Sign up form for 2021.
# Most of the logic hasn't changed since the 2017 form, but the 2020 form added
# support for "at_home" as an event type.
class HocSignup2021 < HocSignup2020
  def self.receipt(data)
    country = data["hoc_event_country_s"].downcase unless data["hoc_event_country_s"].nil_or_empty?
    if %w(ar bo cl co cr cu do ec gq gt hn mx ni pa pe pr py sv uy ve).include? country
      'hoc_signup_2021_receipt_es'
    elsif country == "br"
      'hoc_signup_2021_receipt_pt'
    else
      'hoc_signup_2021_receipt_en'
    end
  end
end
