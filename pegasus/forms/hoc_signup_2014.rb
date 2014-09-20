class HocSignup2014

  def self.normalize(data)
    result = {}
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = required stripped data[:name_s]
    result[:organization_name_s] = required stripped data[:organization_name_s]
    result[:event_type_s] = enum(data[:event_type_s].to_s.strip.downcase, ['in_school', 'out_of_school'])
    result[:event_location_s] = stripped data[:event_location_s]
    result[:entire_school_flag_b] = stripped data[:entire_school_flag_b]
    result[:send_posters_flag_b] = stripped data[:send_posters_flag_b]
    result[:send_posters_address_s] = stripped data[:send_posters_address_s]
    result[:special_event_flag_b] = stripped data[:special_event_flag_b]
    result[:special_event_details_s] = stripped data[:special_event_details_s]
    result[:hoc_country_s] = enum(data[:hoc_country_s].to_s.strip.downcase, HOC_COUNTRIES.keys)
    result
  end

  def self.receipt()
    'hoc_signup_2014_receipt'
  end

  def self.process(data)
    result = {}
    result['location_p'] = geocode_address(data['event_location_s']) unless data['event_location_s'].nil_or_empty?
    result
  end

  def self.solr_query(params)
    query = '*:*'

    fq = []
    fq.push("kind_s:HocSignup2014")
    {
      q:query,
      fq:fq,
      rows: 100000,
    }
  end
end
