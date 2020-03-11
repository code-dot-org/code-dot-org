require pegasus_dir 'helper_modules/forms'

class VolunteerEngineerSubmission2015 < VolunteerEngineerSubmission
  # Ability for volunteers to have a custom unsubscribe preference from teacher
  # requests was added during HoC 2015. They had two options to unsubscribe: until the
  # following year or to unsubscribe from teacher requests forever. Language was later
  # updated so that "until next year" was "until next Hour of Code." That way we don't
  # have to have an untilXXXX every year, and we can just update the query before
  # and after each Hour of Code.
  UNSUBSCRIBE_HOC = "untilhoc".freeze
  UNSUBSCRIBE_FOREVER = "forever".freeze
  DEFAULT_DISTANCE_MILES = 20
  DEFAULT_DISTANCE_KM = 32
  DEFAULT_NUM_VOLUNTEERS = 50

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
    result[:age_18_plus_b] = required data[:age_18_plus_b]
    result[:unsubscribed_s] = nil_if_empty data[:unsubscribed_s]
    result[:email_preference_opt_in_s] = required enum(data[:email_preference_opt_in_s].to_s.strip.downcase, ['yes', 'no'])

    result
  end

  def self.commitments
    (@commitments ||= {})[I18n.locale] ||= commitments_with_i18n_labels(
      'annually',
      'monthly',
      'weekly',
      'more',
    )
  end

  def self.locations
    (@locations ||= {})[I18n.locale] ||= locations_with_i18n_labels(
      'onsite',
      'remote',
    )
  end

  def self.experiences
    (@experiences ||= {})[I18n.locale] ||= experiences_with_i18n_labels(
      'unspecified',
      'tech_company',
      'university_student_or_researcher',
      'software_professional',
    )
  end

  def self.distances
    # distance is in km
    (@distances ||= {})[I18n.locale] ||= distances_with_i18n_labels(
      '8',
      '16',
      '24',
      '32',
    )
  end

  def self.num_volunteers
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

  def self.process_with_ip(data, created_ip)
    if data['email_preference_opt_in_s'] && created_ip && data['email_s']
      EmailPreferenceHelper.upsert!(
        email: data['email_s'],
        opt_in: data['email_preference_opt_in_s'] == 'yes',
        ip_address: created_ip,
        source: EmailPreferenceHelper::FORM_VOLUNTEER,
        form_kind: '0'
      )
    end

    {}.tap do |results|
      location = search_for_address(data['location_s'])
      results.merge! location.summarize if location
    end
  end

  def self.query(params)
    query = ::PEGASUS_DB[:forms].
      where(
        kind: name,
        Forms.json('data.allow_contact_b') => true,
      ).
      exclude(
        Sequel.function(:coalesce, Forms.json('data.unsubscribed_s'), '') => UNSUBSCRIBE_FOREVER
      ).
      order(Sequel.desc(:id))

    # UNSUBSCRIBE_HOC means a volunteer said "I want to unsubscribe until the next Hour of Code".
    # We don't want them to be getting volunteer requests until then.  So, if we're not currently
    # in Hour of Code, don't show that volunteer, and do that by including UNSUBSCRIBE_HOC here.
    unless ["soon-hoc", "actual-hoc"].include?(DCDO.get("hoc_mode", CDO.default_hoc_mode))
      query = query.exclude(
        Sequel.function(:coalesce, Forms.json('data.unsubscribed_s'), '') => UNSUBSCRIBE_HOC
      )
    end

    coordinates = params['coordinates']
    distance = params['distance'] || DEFAULT_DISTANCE_KM
    rows = params['num_volunteers'] || DEFAULT_NUM_VOLUNTEERS

    unless params['location_flexibility_ss'].nil_or_empty?
      location_choices = params['location_flexibility_ss'].map do |location|
        "\"#{location}\""
      end.join(',')

      location_choices = "[#{location_choices}]"

      query = query.where(
        Sequel.function(:json_contains,
          Forms.json('data.location_flexibility_ss'),
          location_choices
        )
      )
    end

    unless params['experience_s'].nil_or_empty?
      query = query.where(
        Forms.json('data.experience_s') => params['experience_s']
      )
    end

    fl = "name_s,company_s,experience_s,location_flexibility_ss,volunteer_after_hoc_b,time_commitment_s,linkedin_s,facebook_s,description_s,allow_contact_b".split(',').map do |field|
      Forms.json("data.#{field}").as(field)
    end

    if coordinates && distance
      distance_query = Sequel.function(:ST_Distance_Sphere,
        Sequel.function(:ST_PointFromText, "POINT (#{coordinates.split(',').reverse.join(' ')})", 4326),
        Sequel.function(:ST_PointFromText,
          Sequel.function(:concat,
            'POINT (',
            Sequel.function(:substring_index, Forms.json('processed_data.location_p'), ',', -1),
            ' ',
            Sequel.function(:substring_index, Forms.json('processed_data.location_p'), ',', 1),
            ')'
          ),
          4326
        )
      ) / 1000
      query = query.where Sequel.lit(Forms.json('processed_data.location_p'))
      query = query.where {distance_query < distance}
      fl.push distance_query.as(:distance)
    end

    docs = query.select(
      *fl,
      Forms.json('processed_data.location_p').as(:location_p),
      :id
    ).limit(rows).to_a
    docs.each do |doc|
      doc[:location_flexibility_ss] = JSON.parse(doc[:location_flexibility_ss])
    end
    {
      facet_counts: {facet_fields: {}},
      response: {docs: docs}
    }.to_json
  end
end
