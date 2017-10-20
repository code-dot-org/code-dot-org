require pegasus_dir 'forms/hoc_signup_2014'

class HocSignup2017 < HocSignup2014
  def self.normalize(data)
    result = super
    result[:nces_school_s] = data[:nces_school_s]
    result[:school_name_s] = data[:school_name_s]
    result[:hoc_event_country_s] = data[:hoc_event_country_s]

    result
  end

  def self.process(data)
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
    super(data).merge!(nces_school_name_s:  nces_school_name)
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
