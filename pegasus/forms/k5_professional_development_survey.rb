class K5ProfessionalDevelopmentSurvey

  AGREEMENT_ANSWERS = (-2..2).map{|i| i.to_s}
  SCALE_ANSWERS = (1..10).map{|i| i.to_s}
  SIMPLE_ANSWERS = (
    ['yes',
    'no',
    ]
  )
  DEGREE_TYPE = (
    ['art',
    'business',
    'computer science',
    'education',
    'engineering',
    'english/literature/humanities',
    'foreign language',
    'mathematics',
    'music',
    'science',
    'social science',
    'other',
    ]
  )

  def self.normalize(data)
    result = {}

    if data[:send_materials_email_s].nil_or_empty?
      result[:email_s] = 'anonymous@code.org'
    else
      result[:email_s] = data[:send_materials_email_s]
    end

    result[:facilitator_prepared_i] = required enum data[:facilitator_prepared_i], AGREEMENT_ANSWERS
    result[:facilitator_knowledgeable_i] = required enum data[:facilitator_knowledgeable_i], AGREEMENT_ANSWERS
    result[:facilitator_enjoyable_i] = required enum data[:facilitator_enjoyable_i], AGREEMENT_ANSWERS
    result[:facilitator_professional_i] = required enum data[:facilitator_professional_i], AGREEMENT_ANSWERS
    result[:workshop_start_i] = required enum data[:workshop_start_i], AGREEMENT_ANSWERS
    result[:workshop_end_i] = required enum data[:workshop_end_i], AGREEMENT_ANSWERS
    result[:workshop_materials_i] = required enum data[:workshop_materials_i], AGREEMENT_ANSWERS
    result[:workshop_venue_i] = required enum data[:workshop_venue_i], AGREEMENT_ANSWERS
    result[:workshop_food_i] = required enum data[:workshop_food_i], AGREEMENT_ANSWERS
    result[:workshop_tech_i] = required enum data[:workshop_tech_i], AGREEMENT_ANSWERS
    result[:experience_courses_i] = required enum data[:experience_courses_i], AGREEMENT_ANSWERS
    result[:experience_useful_i] = required enum data[:experience_useful_i], AGREEMENT_ANSWERS
    result[:experience_sequence_i] = required enum data[:experience_sequence_i], AGREEMENT_ANSWERS
    result[:experience_attention_i] = required enum data[:experience_attention_i], AGREEMENT_ANSWERS
    result[:experience_time_i] = required enum data[:experience_time_i], AGREEMENT_ANSWERS
    result[:experience_bestpd_i] = required enum data[:experience_bestpd_i], AGREEMENT_ANSWERS
    result[:experience_level_i] = required enum data[:experience_level_i], AGREEMENT_ANSWERS
    result[:experience_equitable_i] = required enum data[:experience_equitable_i], AGREEMENT_ANSWERS
    result[:beliefs_i] = required enum data[:beliefs_i], SCALE_ANSWERS
    result[:knowledge_i] = required enum data[:knowledge_i], SCALE_ANSWERS
    result[:cscareers_i] = required enum data[:cscareers_i], SCALE_ANSWERS
    result[:satisfaction_s] = required enum data[:satisfaction_s].to_s.strip.downcase, [
      'extremely satisfied (would recommend to others)',
      'moderately satisfied',
      'neither satisfied nor dissatisfied',
      'moderately dissatisfied',
      'dissatisfied (would not recommend to others)',
    ]
    result[:improve_pd_s] = stripped data[:improve_pd_s]
    result[:teacher_type_s] = required enum data[:teacher_type_s].to_s.strip.downcase, [
      'in-service teacher, currently teaching',
      'pre-service teacher, also working in a classroom under a master-teacher',
      'pre-service teacher, not in a classroom',
      'instructional assistant',
      'out-of-school educator',
      'administrator',
      'other',
    ]
    result[:teacher_type_other_s] = required stripped data[:teacher_type_other_s] if result[:teacher_type_s] == 'other'
    result[:district_s] = stripped data[:district_s]
    result[:school_s] = stripped data[:school_s]
    result[:school_type_s] = required enum data[:school_type_s].to_s.strip.downcase, [
      'public school',
      'charter (public or private)',
      'private school',
      'parochial/religious',
      'after-schoool',
      'summer camp',
      'home school',
      'other',
    ]
    result[:school_type_other_s] = required stripped data[:school_type_other_s] if result[:school_type_s] == 'other'
    result[:teacher_years_s] = required enum data[:teacher_years_s], [
      '0-2',
      '3-5',
      '6-10',
      '11-15',
      '16-20',
      '21-25',
      '26+',
    ]
    result[:teacher_grades_ss] = required enum data[:teacher_grades_ss], [
      'pre-kindergarten',
      'kindergarten',
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
    ]
    result[:teacher_describe_s] = required enum data[:teacher_describe_s].to_s.strip.downcase, [
      'elementary classroom teacher',
      'math teacher',
      'science teacher',
      'computer or technology teacher',
      'librarian',
      'stem specialist',
      'other',
    ]
    result[:teacher_describe_other_s] = required stripped data[:teacher_describe_other_s] if result[:teacher_describe_s] == 'other'
    result[:course_offering_s] = required enum data[:course_offering_s].to_s.strip.downcase, [
      'yes',
      'no',
      'maybe',
    ]
    result[:teaching_cs_s] = required enum data[:teaching_cs_s].to_s.strip.downcase, SIMPLE_ANSWERS
    result[:cs_materials_ss] = enum data[:cs_materials_ss].to_s.strip.downcase, [
      'scratch',
      'tynker',
      'lightbot',
      'alice',
      'appinventor',
      'code.org',
      'other',
    ]
    result[:cs_materials_other_s] = required stripped data[:cs_materials_other_s] if result[:cs_materials_ss] == 'other'
    result[:undergrad_degree_s] = required enum data[:undergrad_degree_s].to_s.strip.downcase, DEGREE_TYPE
    result[:undergrad_degree_other_s] = required stripped data[:undergrad_degree_other_s] if result[:undergrad_degree_s] == 'other'
    result[:grad_degree_s] = required enum data[:grad_degree_s].to_s.strip.downcase, SIMPLE_ANSWERS
    result[:grad_type_s] = required enum data[:grad_type_s].to_s.strip.downcase, DEGREE_TYPE
    result[:grad_type_other_s] = required stripped data[:grad_type_other_s] if result[:grad_type_s] == 'other'
    result[:cs_certification_s] = required enum data[:cs_certification_s].to_s.strip.downcase, SIMPLE_ANSWERS
    result[:cs_professional_s] = required enum data[:cs_professional_s].to_s.strip.downcase, SIMPLE_ANSWERS
    result[:other_teachers_s] = required enum data[:other_teachers_s].to_s.strip.downcase, SIMPLE_ANSWERS
    result[:gender_s] = required enum data[:gender_s].to_s.strip.downcase, [
      'female',
      'male',
      'other or prefer not to answer',
    ]
    result[:race_ss] = required enum data[:race_ss].to_s.strip.downcase, [
      'white/caucasian',
      'hispanic or latino/latina',
      'african american/black',
      'asian, hawaiian or pacific islander',
      'native american or american indian',
      'prefer not to answer',
      'other',
    ]
    result[:race_other_s] = required stripped data[:race_other_s] if result[:race_ss] == 'other'
    result[:age_s] = required enum data[:age_s].to_s.strip.downcase, [
      '< 20',
      '21-25',
      '26-30',
      '31-35',
      '36-40',
      '41-45',
      '46-50',
      '51+',
    ]

    result[:send_materials_flag_b] = stripped data[:send_materials_flag_b]

    if result[:send_materials_flag_b].to_i == 1
      result[:send_materials_name_s] = required stripped data[:send_materials_name_s]
      result[:send_materials_street1_s] = required stripped data[:send_materials_street1_s]
      result[:send_materials_street2_s] = stripped data[:send_materials_street2_s]
      result[:send_materials_city_s] = required stripped data[:send_materials_city_s]
      result[:send_materials_state_s] = required stripped data[:send_materials_state_s]
      result[:send_materials_zip_s] = required stripped data[:send_materials_zip_s]
      result[:send_materials_email_s] = required stripped data[:send_materials_email_s]
      result[:send_materials_phone_s] = required stripped data[:send_materials_phone_s]
      result[:send_materials_course_s] = required enum data[:send_materials_course_s].to_s.strip.downcase, [
        'course 1 (beginners to computer science; early)',
        'course 2 (beginners to computer science; readers)',
        'course 3 (builds on course 2)',
      ]
    end

    result

  end

end
