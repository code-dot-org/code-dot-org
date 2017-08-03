# == Schema Information
#
# Table name: pd_workshop_surveys
#
#  id               :integer          not null, primary key
#  pd_enrollment_id :integer          not null
#  form_data        :text(65535)      not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  type             :string(255)
#
# Indexes
#
#  index_pd_workshop_surveys_on_pd_enrollment_id  (pd_enrollment_id) UNIQUE
#

class Pd::WorkshopSurvey < ActiveRecord::Base
  include Pd::FacilitatorSpecificForm

  belongs_to :pd_enrollment, class_name: "Pd::Enrollment"
  validates_presence_of :pd_enrollment

  STRONGLY_DISAGREE_TO_STRONGLY_AGREE = [
    'Strongly Disagree',
    'Disagree',
    'Slightly Disagree',
    'Slightly Agree',
    'Agree',
    'Strongly Agree'
  ].freeze

  OTHER = 'Other'.freeze
  YES = 'Yes'.freeze
  NO = 'No'.freeze

  def self.required_fields
    [
      :will_teach,
      :reason_for_attending,
      :how_heard,
      :received_clear_communication,
      :school_has_tech,
      :how_much_learned,
      :how_motivating,
      :how_much_participated,
      :how_often_talk_about_ideas_outside,
      :how_often_lost_track_of_time,
      :how_excited_before,
      :overall_how_interested,
      :more_prepared_than_before,
      :know_where_to_go_for_help,
      :suitable_for_my_experience,
      :would_recommend,
      :best_pd_ever,
      :part_of_community,
      :willing_to_talk,
    ].freeze
  end

  def self.facilitator_required_fields
    [
      :how_clearly_presented,
      :how_interesting,
      :how_often_given_feedback,
      :help_quality,
      :how_comfortable_asking_questions,
      :how_often_taught_new_things,
      :things_facilitator_did_well,
      :things_facilitator_could_improve
    ].freeze
  end

  def self.demographics_required_fields
    [
      :gender,
      :race,
      :age,
      :years_taught,
      :grades_taught,
      :grades_planning_to_teach,
      :subjects_taught
    ].freeze
  end

  def self.find_by_user(user)
    joins(:pd_enrollment).where(pd_enrollments: {user_id: user.id})
  end

  def get_facilitator_names
    pd_enrollment ? pd_enrollment.workshop.facilitators.pluck(:name) : []
  end

  # Is this the first survey completed by this user? Note that we use
  # Pd::WorkshopSurvey rather than self.class because we don't care which kind
  # of survey (local summer or regular) it was.
  def first_survey_for_user?
    pd_enrollment && (pd_enrollment.user.nil? || Pd::WorkshopSurvey.find_by_user(pd_enrollment.user).empty?)
  end

  def validate_required_fields
    hash = sanitize_form_data_hash

    # validate conditional required fields
    if hash.try(:[], :will_teach) == NO
      add_key_error(:will_not_teach_explanation) unless hash.key?(:will_not_teach_explanation)
    end

    if hash.try(:[], :reason_for_attending) == OTHER
      add_key_error(:reason_for_attending_other) unless hash.key?(:reason_for_attending_other)
    end

    if hash.try(:[], :how_heard) == OTHER
      add_key_error(:how_heard_other) unless hash.key?(:how_heard_other)
    end

    if hash.try(:[], :how_heard) == OTHER
      add_key_error(:how_heard_other) unless hash.key?(:how_heard_other)
    end

    if hash.try(:[], :willing_to_talk) == YES
      add_key_error(:how_to_contact) unless hash.key?(:how_to_contact)
    end

    # if this is the first survey completed by this user, also require
    # demographics questions.
    if first_survey_for_user?
      self.class.demographics_required_fields.each do |field|
        add_key_error(field) unless hash.key?(field)
      end
    end

    super
  end

  def self.options
    {
      will_teach: [
        YES,
        NO
      ],

      reason_for_attending: [
        'Personal interest',
        'Heard about it from someone else who attended and thought it was a worthwhile program.',
        'I have been asked to teach CS and felt I needed to attend some teacher training.',
        'School/district suggested this program',
        'School/district required this program',
        OTHER
      ],

      how_heard: [
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

      received_clear_communication: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,

      school_has_tech: [
        YES,
        NO
      ],

      how_much_learned: [
        'Almost nothing',
        'A little bit',
        'Some',
        'Quite a bit',
        'A tremendous amount'
      ],

      how_motivating: [
        'Not at all motivating',
        'Slightly motivating',
        'Somewhat motivating',
        'Quite motivating',
        'Extremely motivating'
      ],

      how_clearly_presented: [
        'Not at all clearly',
        'Slightly clearly',
        'Somewhat clearly',
        'Quite clearly',
        'Extremely clearly'
      ],

      how_interesting: [
        'Not at all interesting',
        'Slightly interesting',
        'Somewhat interesting',
        'Quite interesting',
        'Extremely interesting'
      ],

      how_often_given_feedback: [
        'Almost never',
        'Once in a while',
        'Sometimes',
        'Often',
        'All the time'
      ],

      help_quality: [
        'Not at all good',
        'Slightly good',
        'Somewhat good',
        'Quite good',
        'Extremely good',
        "N/A - I didn't need extra help"
      ],

      how_comfortable_asking_questions: [
        'Not at all comfortable',
        'Slightly comfortable',
        'Somewhat comfortable',
        'Quite comfortable',
        'Extremely comfortable'
      ],

      how_often_taught_new_things: [
        'Almost never',
        'Once in a while',
        'Sometimes',
        'Often',
        'All the time'
      ],

      how_much_participated: [
        'Not at all',
        'A little bit',
        'Some',
        'Quite a bit',
        'A tremendous amount'
      ],

      how_often_talk_about_ideas_outside: [
        'Almost never',
        'Once in a while',
        'Sometimes',
        'Often',
        'Almost always'
      ],

      how_often_lost_track_of_time: [
        'Almost never',
        'Once in a while',
        'Sometimes',
        'Often',
        'Almost always'
      ],

      how_excited_before: [
        'Not at all excited',
        'A little bit excited',
        'Somewhat excited',
        'Quite excited',
        'Extremely excited'
      ],

      overall_how_interested: [
        'Not at all interested',
        'A little bit interested',
        'Somewhat interested',
        'Quite interested',
        'Extremely interested'
      ],

      more_prepared_than_before: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      know_where_to_go_for_help: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      suitable_for_my_experience: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      would_recommend: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      best_pd_ever: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      part_of_community: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,

      willing_to_talk: [
        YES,
        NO
      ],

      gender: [
        'Male',
        'Female',
        OTHER,
        'Prefer not to say'
      ],

      race: [
        'White',
        'Black or African American',
        'Hispanic or Latino',
        'Asian',
        'Native Hawaiian or other Pacific Islander',
        'American Indian/Alaska Native',
        OTHER,
        'Prefer not to say'
      ],

      age: [
        '21 - 25',
        '26 - 30',
        '31 - 35',
        '36 - 40',
        '41 - 45',
        '46 - 55',
        '56 - 65',
        '66+'
      ],

      grades_taught: [
        'pre-K',
        'Elementary',
        'Middle School/Junior High',
        'High School'
      ],
      grades_planning_to_teach: [
        'pre-K',
        'Elementary',
        'Middle School/Junior High',
        'High School'
      ],

      subjects_taught: [
        'Computer Science',
        'English/Language Arts',
        'Science',
        'Math',
        'Arts/Music',
        OTHER
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
    }.freeze
  end
end
