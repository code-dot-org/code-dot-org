require pegasus_dir 'forms/hoc_signup_2022'

# HOC Sign up form for 2023.
# Most of the logic hasn't changed since the 2022 form, but more options were added to the 'email_preference_opt_in_s' field.
class HocSignup2023 < HocSignup2022
  def self.normalize(data)
    Honeybadger.context({data: data})
    result = {}
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = required stripped data[:name_s]
    result[:organization_name_s] = stripped data[:organization_name_s]
    result[:event_type_s] = required enum(data[:event_type_s].to_s.strip.downcase, ['in_school', 'after_school', 'out_of_school', 'at_home'])
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
    result[:email_preference_opt_in_s] = required enum(data[:email_preference_opt_in_s].to_s.strip.downcase, %w[yes_elementary yes_middle yes_high yes_general no])
    result
  end

  def self.receipt(data)
    'hoc_signup_2023_receipt_en'
  end
end
