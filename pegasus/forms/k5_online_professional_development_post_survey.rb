class K5OnlineProfessionalDevelopmentPostSurvey
  AGREEMENT_ANSWERS = (-2..2).map(&:to_s)
  SCALE_ANSWERS = (1..10).map(&:to_s)
  SIMPLE_ANSWERS = %w(
    yes
    no
  )

  def self.normalize(data)
    result = {}

    # Email and name come from the dashboard user.
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = stripped data[:name_s]

    result[:experience_useful_i] = required enum data[:experience_useful_i], AGREEMENT_ANSWERS
    result[:experience_time_i] = required enum data[:experience_time_i], AGREEMENT_ANSWERS
    result[:experience_level_i] = required enum data[:experience_level_i], AGREEMENT_ANSWERS

    result[:knowledge_i] = required enum data[:knowledge_i], SCALE_ANSWERS
    result[:cscareers_i] = required enum data[:cscareers_i], SCALE_ANSWERS
    result[:confidence_i] = required enum data[:confidence_i], SCALE_ANSWERS
    result[:necessity_i] = required enum data[:necessity_i], SCALE_ANSWERS
    result[:attend_another_online_pd_i] = required enum data[:attend_another_online_pd_i], SCALE_ANSWERS
    result[:satisfaction_s] = required enum data[:satisfaction_s].to_s.strip.downcase, [
                                                                                         'extremely satisfied (would recommend to others)',
                                                                                         'moderately satisfied',
                                                                                         'neither satisfied nor dissatisfied',
                                                                                         'moderately dissatisfied',
                                                                                         'dissatisfied (would not recommend to others)',
                                                                                     ]
    result[:improve_pd_s] = stripped data[:improve_pd_s]

    result[:teacher_country_s] = required enum data[:teacher_country_s].to_s.strip.downcase, [
                                                                                         'united states',
                                                                                         'canada',
                                                                                         'united kingdom / ireland',
                                                                                         'australia',
                                                                                         'new zealand',
                                                                                         'administrator',
                                                                                         'other',
                                                                                     ]
    # result[:teacher_state_s] = stripped data[:teacher_state_s]
    # puts data[:teacher_state_s]
    result[:teacher_state_s] = required stripped data[:teacher_state_s] if result[:teacher_country_s] == 'united states' || result[:teacher_country_s] == 'canada' || result[:teacher_country_s] == 'australia'
    result[:teacher_city_s] = required stripped data[:teacher_city_s]
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
    result[:school_s] = stripped data[:school_s]
    result[:teacher_years_s] = required enum data[:teacher_years_s], [
                                                                       '0-2',
                                                                       '3-5',
                                                                       '6-10',
                                                                       '11-15',
                                                                       '16-20',
                                                                       '21-25',
                                                                       '26+',
                                                                   ]
    result[:teacher_grades_ss] = enum data[:teacher_grades_ss], [
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
    # Temporary until enum issue is addressed.
    result[:teacher_grades_ss] = data[:teacher_grades_ss]

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
    result[:teaching_cs_s] = required enum data[:teaching_cs_s].to_s.strip.downcase, SIMPLE_ANSWERS
    result[:course_offering_s] = required enum data[:course_offering_s].to_s.strip.downcase, %w(
      yes
      no
      maybe
    )
    result[:number_teaching_i] = required stripped data[:number_teaching_i]
    result[:attend_in_person_pd_i] = required enum data[:attend_in_person_pd_i], SCALE_ANSWERS

    result

  end

end
