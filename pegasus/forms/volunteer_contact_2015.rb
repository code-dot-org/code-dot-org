class VolunteerContact2015

  def self.normalize(data)
    result = {}

    result[:name_s] = required stripped data[:teacher_name_s]
    result[:email_s] = required email_address data[:teacher_email_s]
    result[:school_name_s] = required stripped data[:school_name_s]
    result[:school_location_s] = required stripped data[:school_location_s]
    result[:email_message_s] = required stripped data[:email_message_s]

    # We use the volunteer's ID from the forms table (kind: VolunteerEngineerSubmission2015)
    # to get the volunteer's name and email when emailing the volunteer about the teacher.
    result[:volunteer_id_i] = required stripped data[:volunteer_id_i]

    form = DB[:forms].where(kind: "VolunteerEngineerSubmission2015", id: data[:volunteer_id_i]).first
    volunteer = JSON.parse(form[:data])

    result[:volunteer_name_s] = volunteer["name_s"]
    result[:volunteer_email_s] = volunteer["email_s"]
    result[:volunteer_secret_s] = form[:secret]

    result
  end

  def self.receipt()
    'volunteer_contact_2015_receipt'
  end

  def self.solr_query(params)
    query = '*:*'

    fq = ["kind_s:#{self.name}"]
    {
      q: query,
      fq: fq,
      rows: 100000,
    }
  end
end
