class HocSignup2017 < HocSignup2014
  def self.normalize(data)
    result = super
    result[:nces_school_s] = data[:nces_school_s]
    result[:school_name_s] = data[:school_name_s]
    result[:hoc_event_country_s] = data[:hoc_event_country_s]
    result[:email_preference_opt_in_s] = required enum(data[:email_preference_opt_in_s].to_s.strip.downcase, ['yes', 'no'])

    result
  end

  def self.process_with_ip(data, created_ip)
    if data['email_preference_opt_in_s'] && created_ip && data['email_s']
      EmailPreferenceHelper.upsert!(
        email: data['email_s'],
        opt_in: data['email_preference_opt_in_s'] == 'yes',
        ip_address: created_ip,
        source: EmailPreferenceHelper::FORM_HOC_SIGN_UP,
        form_kind: '0'
      )
    end

    # If there is an nces school id then we need to load that school's address and use it as the event location.
    # A school id of "-1" indicates that the school was not found in the school dropdown so we treat that the
    # same as no school id.
    nces_school_id = data['nces_school_s']
    nces_school_name = ''
    if nces_school_id && nces_school_id != "-1"
      # id is the primary key of the schools table so we shouldn't get back more than one row
      DASHBOARD_DB[:schools].where(id: nces_school_id).each do |school_data|
        school_address_field_names = [:address_line1, :address_line2, :address_line3, :city, :state, :zip]
        school_address_fields = school_address_field_names.map {|k| school_data[k]}
        school_address = school_address_fields.join(' ')
        data['event_location_s'] = school_address
        nces_school_name = school_data[:name]
      end
    end
    # Call process in the parent class.
    process(data).merge!(nces_school_name_s: nces_school_name)
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
