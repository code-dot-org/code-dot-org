require 'cdo/date'

class DistrictPartnerSubmission

  def self.normalize(data)
    result = {}

    # School district information
    result[:district_name_s] = required stripped data[:district_name_s]
    result[:office_city_s] = required stripped data[:office_city_s]
    result[:office_state_s] = required stripped data[:office_state_s]

    # Contact information
    result[:user_first_name_s] = required stripped data[:user_first_name_s]
    result[:user_last_name_s] = required stripped data[:user_last_name_s]
    result[:user_phone_s] = required stripped data[:user_phone_s]
    result[:user_email_s] = required email_address data[:user_email_s]

    result[:email_s] = required email_address data[:user_email_s]

    result
  end

  def self.process(data)
    main_district_address = [
      data['office_city_s'],
      data['office_state_s'],
    ].join(' ')

    {
      'location_p' => data['location_p'] || geocode_address(main_district_address)
    }
  end

end
