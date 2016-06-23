class HocSurvey2015

  def self.normalize(data)
    result = {}

    result[:email_s] = Poste.decrypt(data[:code_s])
    result[:event_country_s] = required stripped data[:event_country_s]
    result[:experience_rating_s] = required stripped data[:experience_rating_s]
    result[:event_location_type_s] = required stripped data[:event_location_type_s]
    result[:school_teach_cs_s] = required stripped data[:school_teach_cs_s]
    result[:cs_interest_s] = required stripped data[:cs_interest_s]
    result[:cs_beyond_hoc_s] = required stripped data[:cs_beyond_hoc_s]
    result[:age_range_ss] = required stripped data[:age_range_ss]
    result[:longer_than_hour_s] = required stripped data[:longer_than_hour_s]
    result[:students_number_total_s] = required integer data[:students_number_total_s]
    result[:students_number_girls_s] = required integer data[:students_number_girls_s]

    if result[:event_country_s].class != FieldError && result[:event_country_s] == 'United States'
      result[:students_number_ethnicity_s] = required integer data[:students_number_ethnicity_s]
    end

    result[:volunteer_participation_s] = required stripped data[:volunteer_participation_s]
    result[:teacher_how_heard_ss] = required stripped data[:teacher_how_heard_ss]

    if result[:teacher_how_heard_ss].class != FieldError && result[:teacher_how_heard_ss].include?('Other')
      result[:teacher_how_heard_other_s] = stripped data[:teacher_how_heard_other_s]
    end

    result[:hoc_centerpiece_s] = required stripped data[:hoc_centerpiece_s]
    result[:event_improvement_s] = stripped data[:event_improvement_s]

    result
  end

  def self.process(data)
    {}
  end

  def self.experience_ratings
    %w[
      Great
      Good
      Ok
      Bad
      Terrible
    ]
  end

  def self.event_location_types
    [
      'Public school',
      'Public charter school',
      'Private school',
      'Parochial/Religious school',
      'After school',
      'Camp or club',
      'Home',
      'Library',
      'Other',
    ]
  end

  def self.beyond_hoc_answers
    [
      'Yes, I already taught computer science before Hour of Code',
      'Yes, I started teach coding after a previous Hour of Code campaign',
      'Yes, I hope to teach coding or computer science beyond one hour',
      'No'
    ]
  end

  def self.age_ranges
    [
      '3-5 years',
      '6-8 years',
      '9-12 years',
      '13-15 years',
      '16-18 years',
      'Older than 18'
    ]
  end

  def self.volunteer_participation_values
    [
      'Yes, someone visited my classroom in person',
      'Yes, someone did a video conference with my classroom',
      'No, I tried contacting a volunteer but I never heard back',
      'No, I didn’t know how to contact a volunteer'
    ]
  end

  def self.teacher_how_heards
    [
      'I read about it in the news or on TV',
      'Email from Code.org',
      'Other teachers in my school',
      'My principal',
      'From the state superintendent (US) or ministry of education (outside US)',
      'From Khan Academy',
      'From DonorsChoose.org',
      'From Teach For America',
      'Other',
    ]
  end

  def self.hoc_centerpiece_values
    [
      'Yes - stay the course, as long as there are new tutorials and community activities under the Hour of Code umbrella each year.',
      'No - I’d prefer something completely different as the centerpiece activity for CS Education Week.'
    ]
  end

end
