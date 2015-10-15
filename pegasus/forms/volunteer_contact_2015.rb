class VolunteerContact2015

  def self.normalize(data)
    result = {}

    result[:teacher_name_s] = required stripped data[:teacher_name_s]
    result[:teacher_email_s] = required email_address data[:teacher_email_s]
    result[:school_name_s] = required stripped data[:school_name_s]
    result[:school_location_s] = required stripped data[:school_location_s]
    result[:email_message_s] = required stripped data[:email_message_s]
    result[:volunteer_id_i] = required stripped data[:volunteer_id_i]

    result
  end

  def self.receipt()
    'volunteer_contact_2015_receipt'
  end

  def self.solr_query(params)
    query = '*:*'

    fq = []
    fq.push("kind_s:#{self.name}")
    {
      q: query,
      fq: fq,
      rows: 100000,
    }
  end
end
