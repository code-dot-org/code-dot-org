require 'state_abbr'

module Pd::ProgramRegistrationForm
  extend ActiveSupport::Concern
  include Pd::Form

  LOCATIONS = [
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA'
  ].freeze

  DATES = [
    'June 18 - 23',
    'July 16 - 21',
    'July 30 - August 4'
  ].freeze

  OTHER = 'Other'.freeze

  TRAVEL_OPTIONS = {
    address_state: STATE_ABBR_WITH_DC_HASH.stringify_keys,

    dietary_needs: [
      'None',
      'Vegetarian',
      'Gluten Free',
      'Food allergy',
      OTHER
    ],

    live_far_away: [
      'Yes',
      'No'
    ],

    how_traveling: [
      'Driving',
      'Flying',
      'Train',
      'Carpooling with another attendee',
      'Public transit'
    ],

    need_hotel: [
      'Yes',
      'No'
    ],

    need_ada: [
      'Yes',
      'No'
    ],
  }.freeze

  PHOTO_RELEASE_OPTIONS = {
    photo_release: [
      'Yes',
      'No',
    ]
  }.freeze

  LIABILITY_WAIVER_OPTIONS = {
    liability_waiver: [
      'Yes',
    ]
  }.freeze

  DEMOGRAPHICS_OPTIONS = {
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

    grades_taught: [
      'Pre-K',
      'Elementary',
      'Middle School/Junior High',
      'High School',
      'I am not teaching'
    ],

    grades_planning_to_teach: [
      'Pre-K',
      'Elementary',
      'Middle School/Junior High',
      'High School',
      'I am not teaching this course'
    ],

    subjects_taught: [
      'Computer Science',
      'English/Language Arts',
      'Science',
      'Math',
      'Arts/Music',
      OTHER
    ]
  }.freeze

  included do
    belongs_to :user
    validates_presence_of :user
    validates_inclusion_of :teachercon, in: 1..3
  end

  module ClassMethods
    def options
      TRAVEL_OPTIONS.
        merge(PHOTO_RELEASE_OPTIONS).
        merge(LIABILITY_WAIVER_OPTIONS).
        merge(DEMOGRAPHICS_OPTIONS).freeze
    end

    def required_fields
      options.keys
    end
  end
end
