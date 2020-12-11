require pegasus_dir 'forms/hoc_signup_2017'

#HOC Sign up form for 2020. 2017 was the last form with new logic
class HocSignup2020 < HocSignup2017
  def self.normalize(data)
    Honeybadger.context({data: data})
    result = {}
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = required stripped data[:name_s]
    result[:organization_name_s] = stripped data[:organization_name_s]
    result[:event_type_s] = required enum(data[:event_type_s].to_s.strip.downcase, ['in_school', 'out_of_school', 'at_home'])
    result[:entire_school_flag_b] = stripped data[:entire_school_flag_b]
    result[:send_posters_flag_b] = stripped data[:send_posters_flag_b]
    result[:send_posters_address_s] = stripped data[:send_posters_address_s]
    result[:special_event_flag_b] = stripped data[:special_event_flag_b]
    result[:special_event_details_s] = stripped data[:special_event_details_s]
    result[:match_volunteer_flag_b] = stripped data[:match_volunteer_flag_b]
    result[:hoc_country_s] = required enum(data[:hoc_country_s].to_s.strip.downcase, HOC_COUNTRIES.keys)
    result[:hoc_company_s] = nil_if_empty data[:hoc_company_s]

    # If the user's school is not found via the school dropdown
    # we still need to require location for US in school events to match
    # to NCES id for census data.
    result[:event_location_s] =
      if result[:event_type_s] == 'in_school' && result[:hoc_country_s] == 'US'
        required stripped data[:event_location_s]
      else
        stripped data[:event_location_s]
      end

    result[:nces_school_s] = data[:nces_school_s]
    result[:school_name_s] = data[:school_name_s]
    result[:hoc_event_country_s] = data[:hoc_event_country_s]
    result[:email_preference_opt_in_s] = required enum(data[:email_preference_opt_in_s].to_s.strip.downcase, ['yes', 'no'])
    result
  end

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
