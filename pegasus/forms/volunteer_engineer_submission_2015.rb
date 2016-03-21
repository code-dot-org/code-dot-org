require pegasus_dir 'forms/volunteer_engineer_submission'

class VolunteerEngineerSubmission2015 < VolunteerEngineerSubmission

  # Ability for volunteers to have a custom unsubscribe preference from teacher
  # requests was added during HoC 2015. They had two options to unsubscribe: until the
  # following year or to unsubscribe from teacher requests forever. Language was later
  # updated so that "until next year" was "until next Hour of Code." That way we don't
  # have to have an untilXXXX every year, and we can just update the query before
  # and after each Hour of Code.
  UNSUBSCRIBE_2016 = "until2016"
  UNSUBSCRIBE_HOC = "untilhoc"
  UNSUBSCRIBE_FOREVER = "forever"
  DEFAULT_DISTANCE = 24 # kilometers
  DEFAULT_NUM_VOLUNTEERS = 10

  def self.normalize(data)
    result = {}

    result[:name_s] = required stripped data[:name_s]
    result[:company_s] = nil_if_empty stripped data[:company_s]
    result[:experience_s] = required data[:experience_s]
    result[:location_s] = required stripped data[:location_s]
    result[:location_flexibility_ss] = required data[:location_flexibility_ss]
    result[:volunteer_after_hoc_b] = nil_if_empty data[:volunteer_after_hoc_b]
    result[:time_commitment_s] = nil_if_empty data[:time_commitment_s]
    result[:linkedin_s] = nil_if_empty stripped data[:linkedin_s]
    result[:facebook_s] = nil_if_empty stripped data[:facebook_s]
    result[:description_s] = required data[:description_s]
    result[:email_s] = required email_address data[:email_s]
    result[:allow_contact_b] = required data[:allow_contact_b]
    result[:unsubscribed_s] = nil_if_empty data[:unsubscribed_s]

    result
  end

  def self.commitments()
    (@commitments ||= {})[I18n.locale] ||= commitments_with_i18n_labels(
      'annually',
      'monthly',
      'weekly',
      'more',
    )
  end

  def self.locations()
    (@locations ||= {})[I18n.locale] ||=  locations_with_i18n_labels(
      'onsite',
      'remote',
    )
  end

  def self.experiences()
    (@experiences ||= {})[I18n.locale] ||= experiences_with_i18n_labels(
      'unspecified',
      'tech_company',
      'university_student_or_researcher',
      'software_professional',
    )
  end

  def self.distances()
    # distance is in km
    (@distances ||= {})[I18n.locale] ||=  distances_with_i18n_labels(
      '8',
      '16',
      '24',
      '32',
    )
  end

  def self.num_volunteers()
    (@num_volunteers ||= {})[I18n.locale] ||= num_volunteers_with_i18n_labels(
      '5',
      '10',
      '25',
      '50',
    )
  end

  def self.locations_with_i18n_labels(*locations)
    results = {}
    locations.each do |location|
      results[location] = I18n.t("volunteer_engineer_submission_location_flexibility_#{location}")
    end
    results
  end

  def self.distances_with_i18n_labels(*distances)
    results = {}
    distances.each do |distance|
      results[distance] = I18n.t("volunteer_engineer_submission_distance_#{distance}")
    end
    results
  end

  def self.num_volunteers_with_i18n_labels(*num_volunteers)
    results = {}
    num_volunteers.each do |num_volunteer|
      results[num_volunteer] = I18n.t("volunteer_engineer_submission_num_volunteers_#{num_volunteer}")
    end
    results
  end

  def self.process(data)
    {}.tap do |results|
      location = search_for_address(data['location_s'])
      results.merge! location.to_solr if location
    end
  end

  def self.solr_query(params)
    # TODO: UNSUBSCRIBE_2016 can be removed completely immediately before Hour of Code 2016.
    # Notify the volunteers that teacher requests will be starting again for Hour of Code 2016.
    # Then we'll regularly remove and add UNSUBSCRIBE_HOC before and after each Hour of Code.
    query = "kind_s:\"#{self.name}\" && allow_contact_b:true && volunteer_after_hoc_b:true && -unsubscribed_s:\"#{UNSUBSCRIBE_FOREVER}\" -unsubscribed_s:\"#{UNSUBSCRIBE_HOC}\" -unsubscribed_s:\"#{UNSUBSCRIBE_2016}\""

    coordinates = params['coordinates']
    distance = params['distance'] || DEFAULT_DISTANCE
    rows = params['num_volunteers'] || DEFAULT_NUM_VOLUNTEERS

    fq = ["{!geofilt pt=#{coordinates} sfield=location_p d=#{distance}}"]

    unless params['location_flexibility_ss'].nil_or_empty?
      params['location_flexibility_ss'].each do |location|
        fq.push("location_flexibility_ss:#{location}")
      end
    end

    fq.push("experience_s:#{params['experience_s']}") unless params['experience_s'].nil_or_empty?

    fl = "name_s,company_s,experience_s,location_flexibility_ss,volunteer_after_hoc_b,time_commitment_s,linkedin_s,facebook_s,description_s,allow_contact_b,location_p,id"

    {
      q: query,
      fq: fq,
      fl: fl,
      facet: true,
      'facet.field'=>['location_flexibility_ss', 'experience_s'],
      rows: rows,
      sort: "random_#{SecureRandom.random_number(10**8)} asc"
    }
  end
end
