require_relative './form'

class PdProgramRegistration < Form
  def self.normalize(data)
    result = {}

    result[:email_s] = required data[:email_s]
    result[:name_s] = "#{required(data[:first_name_s])} #{required(data[:last_name_s])}"

    result[:user_id_i] = required integer data[:user_id_i]

    result[:pd_teacher_application_id_i] = integer data[:pd_teacher_application_id_i]
    [:first_name_s, :last_name_s, :phone_number_s].each do |key|
      result[key] = data[key] # not required
    end
    [:selected_course_s, :accepted_workshop_s].each do |key|
      result[key] = required data[key]
    end

    result[:accept_b] = required data[:accept_b]
    if result[:accept_b] == '0'
      result[:accept_no_reason_s] = required data[:accept_no_reason_s]
      if result[:accept_no_reason_s] == OTHER
        result[:accept_no_other_s] = data[:accept_no_other_s]
      end
    end

    if result[:accept_b] == '1'
      result[:address_s] = required stripped data[:address_s]
      result[:city_s] = required stripped data[:city_s]
      result[:state_s] = required data[:state_s]
      result[:zip_code_s] = required zip_code data[:zip_code_s]

      result[:emergency_contact_name_s] = required stripped data[:emergency_contact_name_s]
      result[:emergency_contact_relationship_s] = required stripped data[:emergency_contact_relationship_s]
      result[:emergency_contact_phone_number_s] = required us_phone_number data[:emergency_contact_phone_number_s]

      result[:dietary_needs_ss] = required_multi_enum data, :dietary_needs_ss
      if result[:dietary_needs_ss].class != FieldError
        result[:dietary_needs_other_s] = stripped data [:dietary_needs_other_s] if result[:dietary_needs_ss].include? OTHER
        result[:allergy_list_s] = stripped data[:allergy_list_s] if result[:dietary_needs_ss].include? FOOD_ALLERGY
      end

      result[:more_than_20_miles_from_tc_b] = required data[:more_than_20_miles_from_tc_b]
      result[:how_traveling_s] = required_enum data, :how_traveling_s
      result[:need_hotel_room_b] = required data[:need_hotel_room_b]
      result[:accessible_room_b] = required data[:accessible_room_b]
      result[:accessible_room_notes_s] = stripped data[:accessible_room_notes_s]

      result[:photo_release_b] = required data[:photo_release_b]
      result[:liability_waiver_b] = required data[:liability_waiver_b]

      result[:gender_s] = required_enum data, :gender_s
      result[:race_ss] = required_multi_enum data, :race_ss
      result[:age_s] = required_enum data, :age_s
      result[:years_taught_k12_s] = integer data[:years_taught_k12_s]
      result[:grades_taught_ss] = required_multi_enum data, :grades_taught_ss
      result[:grades_planning_to_teach_ss] = required_multi_enum data, :grades_planning_to_teach_ss

      result[:how_implement_csd_s] = required_enum data, :how_implement_csd_s if result[:selected_course_s] == 'csd'

      result[:subjects_taught_ss] = required_multi_enum data, :subjects_taught_ss
      result[:years_taught_cs_s] = integer data[:years_taught_cs_s]
    end

    result
  end

  # The forms table has a unique constraint on kind & source_id,
  # so setting this to the application id will prevent duplicate entries
  def self.get_source_id(data)
    data[:pd_teacher_application_id_i]
  end

  def self.required_enum(data, field_name)
    required enum data[field_name], OPTIONS[field_name]
  end

  def self.required_multi_enum(data, field_name)
    values = required data[field_name]
    return values if values.class == FieldError
    return FieldError.new(field_name, :invalid) if values.any? {|v| !OPTIONS[field_name].include?(v)}
    values
  end

  def self.options_for(field_name)
    # strip off tailing [] on _ss fields, then symbolize
    symbolized_field_name = field_name.gsub(/_ss\[\]$/, '_ss').to_sym
    OPTIONS[symbolized_field_name]
  end

  OTHER = 'Other'.freeze
  FOOD_ALLERGY = 'Food Allergy'.freeze

  OPTIONS = {
    accept_no_reason_s: [
      'I want to participate in the program, but I’m no longer able to attend these dates. ' \
        '(Please note: if you select this option, we will place you on our waitlist, and offer you a space in another workshop if a spot becomes available).',
      'I am no longer going to teach this course in 2017-18.',
      'My principal no longer approves of my participation in this program.',
      OTHER
    ],

    dietary_needs_ss: [
      'None',
      'Vegetarian',
      'Gluten Free',
      FOOD_ALLERGY,
      OTHER
    ],

    how_traveling_s: [
      'Driving',
      'Flying',
      'Train',
      'Carpooling with another attendee',
      'Public transit'
    ],

    gender_s: [
      'Male',
      'Female',
      OTHER,
      'Prefer not to say'
    ],

    race_ss: [
      'White',
      'Black or African American',
      'Hispanic or Latino',
      'Asian',
      'Native Hawaiian or other Pacific Islander',
      'American Indian/Alaska Native',
      OTHER,
      'Prefer not to say'
    ],

    age_s: [
      '21-25',
      '26-30',
      '31-35',
      '36-40',
      '41-45',
      '46-50',
      '51-55',
      '56-60',
      '61-65',
      '66+',
      'Prefer not to say'
    ],

    grades_taught_ss: [
      'Pre-K',
      'Elementary',
      'Middle School/Junior High',
      'High School',
      'I am not teaching'
    ],
    grades_planning_to_teach_ss: [
      'Pre-K',
      'Elementary',
      'Middle School/Junior High',
      'High School',
      'I am not teaching this course'
    ],

    how_implement_csd_s: [
      'I plan to teach the full course in 2017-18',
      'I plan to teach the first semester in 2017-18, and the second semester in 2018-19',
      'I only plan to teach the first semester of the course',
      "I don't know my plans yet"
    ],

    subjects_taught_ss: [
      'Computer Science',
      'English/Language Arts',
      'Science',
      'Math',
      'Arts/Music',
      OTHER
    ]
  }

  def self.receipt
    'pd_program_registration_receipt'
  end

  def self.process_(form)
    # Save this form id in the relevant dashboard pd_teacher_application row, if applicable
    id = form[:id]
    data = JSON.load(form[:data])
    application_id = data['pd_teacher_application_id_i']
    if application_id
      DASHBOARD_DB[:pd_teacher_applications].where(id: application_id).update(program_registration_id: id)
    end

    # We don't actually need to save any processed data with the form, so return an empty hash.
    {}
  end
end
