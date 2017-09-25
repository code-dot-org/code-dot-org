require_relative './form'

class PdWorkshopSurvey < Form
  def self.normalize(data)
    result = {}

    result[:user_id_i] = integer data[:user_id_i]
    result[:email_s] = required data[:email_s]
    result[:name_s] = required data[:name_s]

    result[:enrollment_id_i] = required integer data[:enrollment_id_i]
    result[:workshop_id_i] = required integer data[:workshop_id_i]
    result[:plp_b] = required data[:plp_b]
    result[:include_demographics_b] = required data[:include_demographics_b]

    result[:consent_b] = required data[:consent_b]
    if result[:consent_b] == '1'
      result[:will_teach_b] = required data[:will_teach_b]
      if result[:will_teach_b] == '0'
        result[:will_not_teach_explanation_s] = required stripped data[:will_not_teach_explanation_s]
      end

      result[:reason_for_attending_ss] = required_multi_enum data, :reason_for_attending_ss
      if result[:reason_for_attending_ss].class != FieldError && result[:reason_for_attending_ss].include?(OTHER)
        result[:reason_for_attending_other_s] = stripped data[:reason_for_attending_other_s]
      end

      result[:how_heard_ss] = required_multi_enum data, :how_heard_ss
      if result[:how_heard_ss].class != FieldError && result[:how_heard_ss].include?(OTHER)
        result[:how_heard_other_s] = required stripped data[:how_heard_other_s]
      end

      result[:received_clear_communication_s] = required enum data[:received_clear_communication_s], AGREE_SCALE_OPTIONS
      result[:school_has_tech_b] = required data[:school_has_tech_b]
      result[:venue_feedback_s] = stripped data[:venue_feedback_s]
      result[:how_much_learned_s] = required_enum data, :how_much_learned_s
      result[:how_motivating_s] = required_enum data, :how_motivating_s

      expected_facilitators = data[:facilitator_names_s]

      unless expected_facilitators.nil? || expected_facilitators.empty?
        result[:who_facilitated_ss] = required_multi_enum(data, :who_facilitated_ss, expected_facilitators)

        unless result[:who_facilitated_ss].class == FieldError
          result[:how_clearly_presented_s] = {}
          result[:how_interesting_s] = {}
          result[:how_often_given_feedback_s] = {}
          result[:help_quality_s] = {}
          result[:how_comfortable_asking_questions_s] = {}
          result[:how_often_taught_new_things_s] = {}
          result[:things_facilitator_did_well_s] = {}
          result[:things_facilitator_could_improve_s] = {}

          result[:who_facilitated_ss].each do |facilitator|
            result[:how_clearly_presented_s][facilitator] = required_enum(data, :how_clearly_presented_s, facilitator)
            result[:how_interesting_s][facilitator] = required_enum(data, :how_interesting_s, facilitator)
            result[:how_often_given_feedback_s][facilitator] = required_enum(data, :how_often_given_feedback_s, facilitator)
            result[:help_quality_s][facilitator] = required_enum(data, :help_quality_s, facilitator)
            result[:how_comfortable_asking_questions_s][facilitator] = required_enum(data, :how_comfortable_asking_questions_s, facilitator)
            result[:how_often_taught_new_things_s][facilitator] = required_enum(data, :how_often_taught_new_things_s, facilitator)
            result[:things_facilitator_did_well_s][facilitator] = stripped(data[:things_facilitator_did_well_s].try(:[], facilitator))
            result[:things_facilitator_could_improve_s][facilitator] = stripped(data[:things_facilitator_could_improve_s].try(:[], facilitator))
          end
        end
      end

      result[:how_much_participated_s] = required_enum data, :how_much_participated_s
      result[:how_often_talk_about_ideas_outside_s] = required_enum data, :how_often_talk_about_ideas_outside_s
      result[:how_often_lost_track_of_time_s] = required_enum data, :how_often_lost_track_of_time_s
      result[:how_excited_before_s] = required_enum data, :how_excited_before_s
      result[:overall_how_interested_s] = required_enum data, :overall_how_interested_s

      result[:more_prepared_than_before_s] = required enum data[:more_prepared_than_before_s], AGREE_SCALE_OPTIONS
      result[:know_where_to_go_for_help_s] = required enum data[:know_where_to_go_for_help_s], AGREE_SCALE_OPTIONS
      result[:suitable_for_my_experience_s] = required enum data[:suitable_for_my_experience_s], AGREE_SCALE_OPTIONS
      result[:would_recommend_s] = required enum data[:would_recommend_s], AGREE_SCALE_OPTIONS
      result[:best_pd_ever_s] = required enum data[:best_pd_ever_s], AGREE_SCALE_OPTIONS
      result[:part_of_community_s] = required enum data[:part_of_community_s], AGREE_SCALE_OPTIONS

      result[:things_you_liked_s] = stripped data[:things_you_liked_s]
      result[:things_you_would_change_s] = stripped data[:things_you_would_change_s]
      result[:anything_else_s] = stripped data[:anything_else_s]

      result[:willing_to_talk_b] = required data[:willing_to_talk_b]
      result[:how_to_contact_s] = required stripped data[:how_to_contact_s] if result[:willing_to_talk_b] == '1'

      if result[:include_demographics_b] == '1'
        result[:gender_s] = required_enum data, :gender_s
        result[:race_ss] = required_multi_enum data, :race_ss
        result[:age_s] = required_enum data, :age_s
        result[:years_taught_i] = integer data[:years_taught_i]
        result[:grades_taught_ss] = required_multi_enum data, :grades_taught_ss
        result[:grades_planning_to_teach_ss] = required_multi_enum data, :grades_planning_to_teach_ss
        result[:subjects_taught_ss] = required_multi_enum data, :subjects_taught_ss
      end

    end

    result
  end

  def self.process_(form)
    # Save this form id in the relevant dashboard pd_enrollment row
    id = form[:id]
    data = JSON.load(form[:data])
    enrollment_id = data['enrollment_id_i']
    DASHBOARD_DB[:pd_enrollments].where(id: enrollment_id).update(completed_survey_id: id)

    # We don't actually need to save any processed data with the form, so return an empty hash.
    {}
  end

  def self.get_source_id(data)
    data[:enrollment_id_i]
  end

  def self.required_enum(data, field_name, field_subname=nil)
    value = data[field_name]
    value = value[field_subname] unless value.nil? || field_subname.nil?
    required enum value, OPTIONS[field_name]
  end

  def self.required_multi_enum(data, field_name, allowed=nil)
    allowed = OPTIONS[field_name] if allowed.nil?
    values = required data[field_name]
    return values if values.class == FieldError
    return FieldError.new(field_name, :invalid) if values.any? {|v| !allowed.include?(v)}
    values
  end

  def self.options_for(field_name)
    # strip off tailing [] on _ss fields, then symbolize
    symbolized_field_name = field_name.gsub(/_ss\[\]$/, '_ss').to_sym
    OPTIONS[symbolized_field_name]
  end

  OTHER = 'Other'

  GRADE_OPTIONS = [
    'pre-K',
    'Elementary',
    'Middle School/Junior High',
    'High School'
  ]

  AGREE_SCALE_OPTIONS = [
    'Strongly Disagree',
    'Disagree',
    'Slightly Disagree',
    'Slightly Agree',
    'Agree',
    'Strongly Agree'
  ]

  def self.agree_scale_options
    AGREE_SCALE_OPTIONS
  end

  OPTIONS = {
    reason_for_attending_ss: [
      'Personal interest',
      'Heard about it from someone else who attended and thought it was a worthwhile program.',
      'I have been asked to teach CS and felt I needed to attend some teacher training.',
      'School/district suggested this program',
      'School/district required this program',
      OTHER
    ],

    how_heard_ss: [
      'Email from Code.org',
      'Social media',
      'Other teachers',
      'From my principal or school district/administration',
      'Email/newsletter from a local organization',
      'School district newsletter',
      'Workshop organizer’s website',
      'Education event/conference',
      OTHER
    ],

    received_clear_communication_s: AGREE_SCALE_OPTIONS,

    how_much_learned_s: [
      'Almost nothing',
      'A little bit',
      'Some',
      'Quite a bit',
      'A tremendous amount'
    ],

    how_motivating_s: [
      'Not at all motivating',
      'Slightly motivating',
      'Somewhat motivating',
      'Quite motivating',
      'Extremely motivating'
    ],

    how_clearly_presented_s: [
      'Not at all clearly',
      'Slightly clearly',
      'Somewhat clearly',
      'Quite clearly',
      'Extremely clearly'
    ],

    how_interesting_s: [
      'Not at all interesting',
      'Slightly interesting',
      'Somewhat interesting',
      'Quite interesting',
      'Extremely interesting'
    ],

    how_often_given_feedback_s: [
      'Almost never',
      'Once in a while',
      'Sometimes',
      'Often',
      'All the time'
    ],

    help_quality_s: [
      'Not at all good',
      'Slightly good',
      'Somewhat good',
      'Quite good',
      'Extremely good',
      "N/A - I didn't need extra help"
    ],

    how_comfortable_asking_questions_s: [
      'Not at all comfortable',
      'Slightly comfortable',
      'Somewhat comfortable',
      'Quite comfortable',
      'Extremely comfortable'
    ],

    how_often_taught_new_things_s: [
      'Almost never',
      'Once in a while',
      'Sometimes',
      'Often',
      'All the time'
    ],

    how_much_participated_s: [
      'Not at all',
      'A little bit',
      'Some',
      'Quite a bit',
      'A tremendous amount'
    ],

    how_often_talk_about_ideas_outside_s: [
      'Almost never',
      'Once in a while',
      'Sometimes',
      'Often',
      'Almost always'
    ],

    how_often_lost_track_of_time_s: [
      'Almost never',
      'Once in a while',
      'Sometimes',
      'Often',
      'Almost always'
    ],

    how_excited_before_s: [
      'Not at all excited',
      'A little bit excited',
      'Somewhat excited',
      'Quite excited',
      'Extremely excited'
    ],

    overall_how_interested_s: [
      'Not at all interested',
      'A little bit interested',
      'Somewhat interested',
      'Quite interested',
      'Extremely interested'
    ],

    gender_s: [
      'Male',
      'Female',
      'Other',
      'Prefer not to say'
    ],

    race_ss: [
      'White',
      'Black or African American',
      'Hispanic or Latino',
      'Asian',
      'Native Hawaiian or other Pacific Islander',
      'American Indian/Alaska Native',
      'Other',
      'Prefer not to say'
    ],

    age_s: [
      '21 - 25',
      '26 - 30',
      '31 - 35',
      '36 - 40',
      '41 - 45',
      '46 - 55',
      '56 - 65',
      '66+'
    ],

    grades_taught_ss: GRADE_OPTIONS,
    grades_planning_to_teach_ss: GRADE_OPTIONS,

    subjects_taught_ss: [
      'Computer Science',
      'English/Language Arts',
      'Science',
      'Math',
      'Arts/Music',
      'Library or Technology Education',
      'Other'
    ]
  }
end
