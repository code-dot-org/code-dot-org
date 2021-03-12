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

class Pd::WorkshopSurvey < ApplicationRecord
  include Pd::FacilitatorSpecificForm

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

  belongs_to :pd_enrollment, class_name: "Pd::Enrollment"

  validates_presence_of :pd_enrollment

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

  def self.implementation_required_fields
    [
      :hours_per_week,
      :weeks_per_year,
      :course_structure,
      :units_planning_to_teach,
      :same_students_multiple_years,
      :combining_curricula,
      :cte_credit,
      :csd_required
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

  # Only show implementation questions if this is the survey
  # for the first CSD Academic Year Workshop of the year.
  def show_implementation_questions?
    pd_enrollment.workshop.subject == Pd::Workshop::SUBJECT_CSD_WORKSHOP_1
  end

  # Returns whether the associated user has been deleted, returning false if the user does not
  # exist. Overrides Pd::Form#owner_deleted?.
  # @return [Boolean] Whether the associated user has been deleted.
  def owner_deleted?
    !!pd_enrollment.try(:user).try(:deleted?)
  end

  def validate_required_fields
    return if owner_deleted?

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

    if show_implementation_questions?
      self.class.implementation_required_fields.each do |field|
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
        'Library or Technology Education',
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
        "10+"
      ],

      hours_per_week: [
        "0 to 30 minutes",
        "Between 30 minutes and an hour",
        "Over an hour (up to 90 minutes)",
        "90 minutes to 3 hours",
        "4 to 5 hours",
        "More than 5 hours"
      ],

      weeks_per_year: [
        "Less Than a Quarter (8 Weeks or Less)",
        "Quarter (~9 weeks)",
        "Trimester (~12 weeks)",
        "Semester (~18 weeks)",
        "Year (~36 weeks)"
      ],

      course_structure: [
        "I am teaching all six units over a full school year.",
        "I am teaching all six units over the course of 2 or 3 years.",
        "I am teaching half of the course (3 units) in a single semester.",
        "I am teaching half of the course (3 units) spread out across multiple semesters or years.",
        "I am teaching 1 or 2 units.",
        OTHER
      ],

      units_planning_to_teach: [
        "Unit 1",
        "Unit 2",
        "Unit 3",
        "Unit 4",
        "Unit 5",
        "Unit 6"
      ],

      same_students_multiple_years: [
        "I only have a set of students for one year. (Or part of a year)",
        "I have the same set of students for multiple years, but only plan to teach CS Discoveries the first year.",
        "I have the same students for multiple years."
      ],

      units_in_later_years: [
        "Unit 1",
        "Unit 2",
        "Unit 3",
        "Unit 4",
        "Unit 5",
        "Unit 6"
      ],

      combining_curricula: [
        "I'm just teaching CS Discoveries.",
        "I also teach typing.",
        "I also teach applications such as Microsoft Office.",
        "I also teach robotics.",
        "I am combining it with other computer science coursework such as Scratch or CS Fundamentals from Code.org.",
        OTHER
      ],

      cte_credit: [
        "Yes, all my students are taking this as part of CTE.",
        "Yes, the course is dual counted - students can take it for CTE or other credit (math, elective, etc.).",
        "No, this is not a CTE course in my school.",
        OTHER
      ],

      csd_required: [
        "Required: All students take my course as part of the standard schedule (unless they have special needs/exceptions).",
        "Optional: Students choose to take it.",
        "Optional: But, many or most of my students are assigned to the course without choosing to take it.",
        OTHER
      ],
    }.freeze
  end
end
