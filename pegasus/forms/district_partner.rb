require 'cdo/date'

  class DistrictPartnerSubmission

  def self.normalize(data)
    result = {}

    # School district information
    result[:district_name_s] = required stripped data[:district_name_s]
    result[:district_partner_districts_s] = stripped data[:district_partner_districts_s]

    # Commitments
    result[:commitment_program_director_b] = stripped data[:commitment_program_director_b]
    result[:commitment_identify_qualified_teacher_b] = stripped data[:commitment_identify_qualified_teacher_b]
    result[:commitment_district_hoc_b] = stripped data[:commitment_district_hoc_b]
    result[:commitment_technology_b] = stripped data[:commitment_technology_b]
    result[:commitment_term_sheet_b] = stripped data[:commitment_term_sheet_b]

    # More district information
    result[:district_total_schools_i] = required stripped data[:district_total_schools_i]
    result[:district_high_schools_i] = required stripped data[:district_high_schools_i]
    result[:district_middle_schools_i] = required stripped data[:district_middle_schools_i]
    result[:district_elementary_schools_i] = required stripped data[:district_elementary_schools_i]
    result[:district_school_year_start_date_dt] = required stripped data[:district_school_year_start_date_dt]
    result[:district_school_year_end_date_dt] = required stripped data[:district_school_year_end_date_dt]
    result[:district_school_year_estimated_b] = stripped data[:district_school_year_estimated_b]

    # Main district office
    result[:office_street_address_s] = required stripped data[:office_street_address_s]
    result[:office_street_address_2_s] = nil_if_empty stripped data[:office_street_address_2_s]
    result[:office_city_s] = required stripped data[:office_city_s]
    result[:office_state_s] = required stripped data[:office_state_s]
    result[:office_postal_code_s] = required stripped data[:office_postal_code_s]
    result[:office_phone_s] = required stripped data[:office_phone_s]
    result[:office_fax_s] = required stripped data[:office_fax_s]
    result[:office_website_s] = required stripped data[:office_website_s]

    # Contact information
    roles.each do |role|
      result[:"#{role}_first_name_s"] = required stripped data[:"#{role}_first_name_s"]
      result[:"#{role}_last_name_s"] = required stripped data[:"#{role}_last_name_s"]
      result[:"#{role}_position_s"] = required stripped data[:"#{role}_position_s"]
      result[:"#{role}_street_address_s"] = required stripped data[:"#{role}_street_address_s"]
      result[:"#{role}_street_address_2_s"] = nil_if_empty stripped data[:"#{role}_street_address_2_s"]
      result[:"#{role}_city_s"] = required stripped data[:"#{role}_city_s"]
      result[:"#{role}_state_s"] = required stripped data[:"#{role}_state_s"]
      result[:"#{role}_postal_code_s"] = required stripped data[:"#{role}_postal_code_s"]
      result[:"#{role}_phone_s"] = required stripped data[:"#{role}_phone_s"]
      result[:"#{role}_fax_s"] = required stripped data[:"#{role}_fax_s"]
      result[:"#{role}_email_s"] = required email_address data[:"#{role}_email_s"]
    end

    result[:coordinator_same_as_user_b] = required stripped data[:coordinator_same_as_user_b]

    # Programs of interest
    result[:program_elementary_school_b] = stripped data[:program_elementary_school_b]
    result[:program_middle_school_b] = stripped data[:program_middle_school_b]
    result[:program_high_school_b] = stripped data[:program_high_school_b]

    # Help
    result[:help_identify_high_schools_b] = stripped data[:help_identify_high_schools_b]
    result[:help_identify_high_schools_number_i] = stripped data[:help_identify_high_schools_number_i]
    result[:help_identify_middle_schools_b] = stripped data[:help_identify_middle_schools_b]
    result[:help_identify_middle_schools_number_i] = stripped data[:help_identify_middle_schools_number_i]
    result[:help_identify_elementary_schools_b] = stripped data[:help_identify_elementary_schools_b]
    result[:help_identify_elementary_schools_number_i] = stripped data[:help_identify_elementary_schools_number_i]

    result[:email_s] = required email_address data[:user_email_s]

    result
  end

  def self.roles()
    roles_and_config.keys
  end

  def self.roles_and_config()
    {'user'=>'Your information (person filling out form)', 'coordinator'=>'District coordinator of the Code.org program'}
  end

  def self.process(data)
    main_district_address = [
      data['office_street_address_s'],
      data['office_street_address_2_s'],
      data['office_city_s'],
      data['office_state_s'],
      data['office_postal_code_s'],
    ].join(' ')

    {
      'location_p' => data['location_p'] || geocode_address(main_district_address)
    }
  end

  def self.index(data)
    data['district_school_year_start_date_dt'] = Chronic.parse(data['district_school_year_start_date_dt']).strftime('%FT%TZ')
    data['district_school_year_end_date_dt'] = Chronic.parse(data['district_school_year_end_date_dt']).strftime('%FT%TZ')

    data
  end

end
