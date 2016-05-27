class ProfessionalDevelopmentWorkshopSignup

  def self.normalize(data)
    result = {}

    result[:name_s] = required stripped data[:name_s]

    result[:email_s] = required stripped email_address data[:email_s]
    result[:email_confirm_s] = required stripped email_address data[:email_confirm_s]
    # This field is no longer used.
    # result[:teacher_title_s] = required stripped data[:teacher_title_s]
    result[:teacher_role_ss] = required stripped data[:teacher_role_ss]
    if result[:teacher_role_ss].class != FieldError && result[:teacher_role_ss].include?('Other')
      result[:teacher_role_other_ss] = required stripped csv_multivalue data[:teacher_role_other_ss]
    end
    result[:teacher_tech_experience_level_s] = required stripped data[:teacher_tech_experience_level_s]
    result[:school_name_s] = required stripped data[:school_name_s]
    result[:school_location_s] = required stripped data[:school_location_s]
    result[:school_type_ss] = required data[:school_type_ss]
    if result[:school_type_ss].class != FieldError && result[:school_type_ss].include?('Other')
      result[:school_type_other_ss] = required stripped csv_multivalue data[:school_type_other_ss]
    end
    result[:school_district_s] = stripped data[:school_district_s]
    result[:school_levels_ss] = required data[:school_levels_ss]
    if result[:school_levels_ss].class != FieldError && result[:school_levels_ss].include?('Other')
      result[:school_levels_other_ss] = required stripped csv_multivalue data[:school_levels_other_ss]
    end
    result[:number_students_s] = required stripped data[:number_students_s]

    result[:email_s] = confirm_match(result[:email_s], result[:email_confirm_s])
    result.delete(:email_confirm_s)

    result
  end

  def self.school_types()
    [
      'Public',
      'Public Charter',
      'Private',
      'Parochial/Religious',
      'After-school',
      'Summer Camp',
    ]
  end

  def self.school_levels()
    [
      'Pre-kindergarten',
      'Kindergarten',
      '1st',
      '2nd',
      '3rd',
      '4th',
      '5th',
    ]
  end

  def self.teacher_roles()
    [
    'Classroom teacher',
    'Computer teacher',
    'Librarian',
    'Administrator',
    ]
  end

  def self.teacher_tech_experience_levels()
    [
      'Beginner (Computer Science is brand new to me; I can’t wait to learn)',
      'Intermediate (I’ve used Code.org or other computer science materials with my students)',
      'Expert (I’ve studied computer science or have worked in the computer science field)',
    ]
  end

  def self.receipt()
    %w(
      workshop_signup_receipt
      workshop_signup_notice
    )
  end

  def self.index(data)
    data['teacher_role_ss'] = (data['teacher_role_ss']||[]) - ['Other']
    data['teacher_role_ss'].concat(data['teacher_role_other_ss'] || []).sort.uniq

    data['school_type_ss'] = (data['school_type_ss']||[]) - ['Other']
    data['school_type_ss'].concat(data['school_type_other_ss'] || []).sort.uniq

    data['school_levels_ss'] = (data['school_levels_ss']||[]) - ['Other']
    data['school_levels_ss'].concat(data['school_levels_other_ss'] || []).sort.uniq

    data['workshop_id_i'] = data['parent_form_i']

    data.delete('teacher_role_other_ss')
    data.delete('school_type_other_ss')
    data.delete('school_levels_other_ss')

    data
  end

end
