module Pd::Application
  module ApplicationConstants
    COURSE_NAMES = {
      csd: 'Computer Science Discoveries',
      csp: 'Computer Science Principles',
      csa: 'Computer Science A'
    }.stringify_keys

    YES = 'Yes'.freeze
    NO = 'No'.freeze
    OTHER = 'Other'.freeze
    OTHER_WITH_TEXT = 'Other:'.freeze
    NONE = 'None'.freeze
    INCOMPLETE = 'Incomplete'.freeze
    REVIEWING_INCOMPLETE = 'Reviewing Incomplete'.freeze

    COMMON_OPTIONS = {
      title: %w(Mr. Mrs. Ms. Mx. Dr.),

      state: get_all_states_with_dc.to_h.values,

      gender_identity: [
        'Female',
        'Male',
        'Non-binary',
        'Preferred term not listed',
        'Prefer not to answer'
      ],

      race: [
        'White',
        'Black or African American',
        'Hispanic or Latino',
        'Asian',
        'Native Hawaiian or other Pacific Islander',
        'American Indian/Alaska Native',
        OTHER,
        'Prefer not to answer'
      ],

      course_hours_per_year: [
        'At least 100 course hours',
        '50 to 99 course hours',
        'Less than 50 course hours'
      ],

      terms_per_year: [
        '1 quarter',
        '1 trimester',
        '1 semester',
        '2 trimesters',
        'A full year',
        OTHER_WITH_TEXT
      ],

      school_type: [
        'Public school',
        'Private school',
        'Charter school',
        'Other'
      ]
    }
  end
end
