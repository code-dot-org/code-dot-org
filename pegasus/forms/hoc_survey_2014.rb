class HocSurvey2014
  
  def self.normalize(data)
    result = {}

    decrypted_email = Poste.decrypt(data[:code_s])
    result[:email_s] = required enum(data[:email_s].to_.strip.downcase, [decrypted_email])

    result[:teacher_name_s] = required stripped data[:name_s]
    result[:event_country_s] = enum(data[:event_country_s].to_s.strip.downcase, HOC_COUNTRIES.keys)
    result[:teacher_description_s] = required stripped data[:teacher_description_s]
    result[:event_location_type_s] = stripped data[:event_location_type_s]
    result[:students_number_total_i] = required stripped data[:students_number_total_i]
    result[:students_number_girls_i] = required stripped data[:students_number_girls_i]
    result[:students_number_ethnicity_i] = required stripped data[:students_number_ethnicity_i]
    result[:students_grade_levels_ss] = stripped data[:students_grade_levels_ss]
    result[:event_tutorials_ss] = stripped data[:event_tutorials_ss]
    result[:event_technology_ss] = stripped data[:event_technology_ss]
    result[:event_experience_s] = required stripped data[:event_experience_s]
    result[:event_improvement_s] = stripped data[:event_improvement_s]
    result[:event_annual_s] = stripped data[:event_annual_s]
    result[:teacher_plan_teach_cs_s] = stripped data[:teacher_plan_teach_cs]
    result[:teacher_first_year_s] = stripped data[:teacher_first_year_s]
    result[:teacher_how_heard_ss] = stripped data[:teacher_how_heard_ss]

    if result[:teacher_how_heard_ss].class != FieldError && result[:teacher_how_heard_ss].include?('Other')
      result[:teacher_how_heard_other_s] = required stripped data[:teacher_how_heard_other_s]
    end

    result
  end

  def self.teacher_descriptions()
    [
      'Computer Science teacher',
      'Classroom teacher (all subjects)',
      'Pre-service teacher or instructional assistant ',
      'Math or Science teacher',
      'Technology teacher',
      'Librarian',
      'Volunteer',
      'English teacher',
      'Social Studies/History teacher',
      'Language teacher',
      'Art or Music teacher',
      'After-school educator',
      'Other',
    ]
  end

  def self.event_location_types()
    [
      'Public school',
      'Public charter school',
      'Private school',
      'Parochial/Religious school ',
      'After school',
      'Camp or club',
      'Home',
      'Library',
      'Other',
    ]
  end

  def self.students_grade_levels()
    [
      'Pre-kindergarten',
      'Kindergarten',
      '1st',
      '2nd',
      '3rd',
      '4th',
      '5th',
      '6th',
      '7th',
      '8th',
      '9th',
      '10th',
      '11th',
      '12th',
      'College or University',
    ]
  end

  def self.event_tutorials()
    [
      'Code with Anna and Elsa',
      'Code with Angry Birds',
      'Tynker',
      'Scratch',
      'LightBot',
      'Khan Academy',
      'CodeHS',
      'Codecademy',
      'CodeCombat',
      'CodeAvengers',
      'Unplugged',
      'CodeSpark',
      'Kodable',
      'CodeMonkey',
      'Processing',
      'RoboMind',
      'Grok Learning',
      'Quorum',
      'MakeSchool',
      'TouchDevelop',
      'Make a Flappy Game',
      'Bitsbox',
      'AppInventor',
      'PlayLab',
      'Other',
    ]
  end

  def self.event_technologies()
    [
      'Each student had a device',
      'Pair programming, sharing a device',
      'In a large group (with a shared screen)',
      'Unplugged only',
    ]
  end

  def self.event_experiences()
    [
      'Great',
      'Good',
      'OK',
      'Bad',
      'Terrible',
    ]
  end

  def self.teacher_how_heards()
    [
      'I read about it in the news or on TV',
      'Email from Code.org',
      'Other teachers in my school',
      'My principal',
      'From the state superintendent (US) or ministry of education (outside US)',
      'From KhanAcademy',
      'From DonorsChoose.org',
      'From Teach For America',
      'Other',
    ]
  end

  def self.claim_prize_code(type, email, params={})
    ip_address = params[:ip_address] || request.ip
  
    begin
      rows_updated = DB[:hoc_survey_prizes].where(claimant:nil, type:type).limit(1).update(
        claimant:email,
        claimed_at:DateTime.now,
        claimed_ip:ip_address,
      )
      raise StandardError, "Out of '#{type}' codes." if rows_updated == 0
    rescue Sequel::UniqueConstraintViolation
      # This user has already claimed a prize, the query below will return that existing prize.
    rescue
      raise
    end

    DB[:hoc_survey_prizes].where(claimant:email).first
  end

end
