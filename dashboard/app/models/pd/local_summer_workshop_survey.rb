# == Schema Information
#
# Table name: pd_local_summer_workshop_surveys
#
#  id               :integer          not null, primary key
#  pd_enrollment_id :integer          not null
#  form_data        :text(65535)
#  day              :integer          not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_pd_ls_workshop_survey_on_pd_enrollment_id_and_day  (pd_enrollment_id,day) UNIQUE
#

class Pd::LocalSummerWorkshopSurvey < ActiveRecord::Base
  include Pd::Form

  belongs_to :pd_enrollment, class_name: "Pd::Enrollment"
  validates_presence_of :pd_enrollment

  STRONGLY_DISAGREE_TO_STRONGLY_AGREE = [
    'Strongly disagree',
    'Disagree',
    'Slightly disagree',
    'Slightly agree',
    'Agree',
    'Strongly agree'
  ].freeze

  def required_fields
    [
      :received_clear_communication,
      :feedback_venue_logistics,
      :how_much_learned,
      :how_motivating,
      :who_facilitated,
      :how_much_participated,
      :how_often_talk_about_ideas_outside,
      :how_often_lost_track_of_time,
      :how_excited_before,
      :overall_how_interested,
      :more_prepared_than_before,
      :know_where_to_go_for_help,
      :suitable_for_my_experience,
      :would_recommend,
      :anticipate_continuing,
      :confident_can_teach,
      :believe_all_students,
      :best_pd_ever,
      :part_of_community,
      :things_you_liked,
      :things_you_would_change,
      :give_permission_to_quote,
      :race,
      :highest_education,
      :degree_field,
      :years_taught_stem,
      :years_taught_cs,
      :have_required_licenses
    ].freeze
  end

  def facilitator_required_fields
    [
      :how_clearly_presented,
      :how_interesting,
      :how_often_given_feedback,
      :help_quality,
      :how_comfortable_asking_questions,
      :how_often_taught_new_things
    ].freeze
  end

  def validate_required_fields
    hash = sanitize_form_data_hash

    if hash.try(:[], :who_facilitated)
      hash[:who_facilitated].each do |facilitator|
        facilitator_required_fields.each do |facilitator_field|
          field_name = "#{facilitator_field}[#{facilitator}]".to_sym
          add_key_error(field_name) unless hash.key?(field_name)
        end
      end
    end

    super
  end

  def self.options
    {
      received_clear_communication: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,

      how_much_learned: [
        "Almost nothing",
        "A little bit",
        "Some",
        "Quite a bit",
        "A tremendous amount",
      ],

      how_motivating: [
        "Not at all motivating",
        "Slightly motivating",
        "Somewhat motivating",
        "Quite motivating",
        "Extremely motivating",
      ],

      how_clearly_presented: [
        "Not at all clearly",
        "Slightly clearly",
        "Somewhat clearly ",
        "Quite clearly",
        "Extremely clearly",
      ],

      how_interesting: [
        "Not at all interesting",
        "Slightly interesting",
        "Somewhat interesting",
        "Quite interesting",
        "Extremely interesting",
      ],

      how_often_given_feedback: [
        "Almost never",
        "Once in a while",
        "Sometimes",
        "Often",
        "All the time",
      ],

      help_quality: [
        "Not at all good",
        "Slightly good",
        "Somewhat good",
        "Quite good",
        "Extremely good",
        "N/A - I didn’t need extra help",
      ],

      how_comfortable_asking_questions: [
        "Not at all comfortable",
        "Slightly comfortable",
        "Somewhat comfortable",
        "Quite comfortable",
        "Extremely comfortable",
      ],

      how_often_taught_new_things: [
        "Almost never",
        "Once in a while",
        "Sometimes",
        "Often",
        "All the time",
      ],

      how_much_participated: [
        "Not at all",
        "A little bit",
        "Some",
        "Quite a bit",
        "A tremendous amount"
      ],

      how_often_talk_about_ideas_outside: [
        "Almost never",
        "Once in a while",
        "Sometimes",
        "Often",
        "Almost always"
      ],

      how_often_lost_track_of_time: [
        "Almost never",
        "Once in a while",
        "Sometimes",
        "Often",
        "Almost always"
      ],

      how_excited_before: [
        "Not at all excited",
        "A little bit excited",
        "Somewhat excited",
        "Quite excited",
        "Extremely excited"
      ],

      overall_how_interested: [
        "Not at all interested",
        "A little bit interested",
        "Somewhat interested",
        "Quite interested",
        "Extremely interested"
      ],

      more_prepared_than_before: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      know_where_to_go_for_help: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      suitable_for_my_experience: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      would_recommend: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      anticipate_continuing: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      confident_can_teach: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      believe_all_students: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      best_pd_ever: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      part_of_community: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,

      give_permission_to_quote: [
        "Yes, I give Code.org permission to quote me and use my name.",
        "Yes, I give Code.org permission to quote me,  but I want to be anonymous. (Your name will not be used.)",
        "No, I do not give Code.org my permission.",
      ],

      race: [
        "White",
        "Black or African American",
        "Hispanic or Latino",
        "Asian",
        "Native Hawaiian or other Pacific Islander",
        "American Indian/Alaska Native",
        "Other",
        "Prefer not to say",
      ],

      highest_education: [
        "High school diploma",
        "Associate's degree",
        "Some college",
        "Bachelor's degree",
        "Master's degree or higher",
      ],

      degree_field: [
        "Art, Music, or Foreign Language",
        "Business",
        "Computer Science",
        "Education",
        "Engineering",
        "English, Language Arts, Drama, or Social Sciences",
        "Mathematics",
        "Science",
        "Other",
      ],

      years_taught_stem: [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10+",
      ],

      years_taught_cs: [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10+",
      ],

      have_required_licenses: [
        "Yes",
        "No",
        "I'm not sure"
      ]

    }.freeze
  end

  def validate_options
    hash = sanitize_form_data_hash

    facilitator_names = pd_enrollment.workshop.facilitators.map(&:name)

    puts hash
    puts hash[:who_facilitated]

    if hash[:who_facilitated]
      hash[:who_facilitated].each do |facilitator|
        add_key_error(key) unless facilitator_names.include? facilitator
      end
    end

    super
  end
end
