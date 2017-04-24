require 'state_abbr'

class Pd::ProgramRegistration < ActiveRecord::Base
  self.abstract_class = true

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

  belongs_to :user

  validates_presence_of :user
  validates_presence_of :form_data
  validates_inclusion_of :teachercon, in: 1..3

  def self.required_fields
    self.class.options.keys
  end

  def self.options
    TRAVEL_OPTIONS.
      merge(PHOTO_RELEASE_OPTIONS).
      merge(LIABILITY_WAIVER_OPTIONS).
      merge(DEMOGRAPHICS_OPTIONS).freeze
  end

  def add_key_error(key)
    key = key.to_s.camelize(:lower)
    errors.add(:form_data, :invalid, message: key)
  end

  validate :validate_required_fields
  def validate_required_fields
    hash = form_data_hash.transform_keys {|key| key.underscore.to_sym}

    # empty fields may come about when the user selects then unselects an
    # option. They should be treated as if they do not exist
    hash.delete_if do |_key, value|
      value.empty?
    end

    self.class.required_fields.each do |key|
      add_key_error(key) unless hash.key?(key)
    end
  end

  validate :validate_options
  def validate_options
    hash = form_data_hash.transform_keys {|key| key.underscore.to_sym}

    hash_with_options = hash.select do |key, _value|
      self.class.options.key? key
    end

    hash_with_options.each do |key, value|
      if value.is_a? Array
        value.each do |subvalue|
          add_key_error(key) unless self.class.options[key].include? subvalue
        end
      else
        add_key_error(key) unless self.class.options[key].include? value
      end
    end
  end

  def update_form_data_hash(update_hash)
    self.form_data_hash = (form_data_hash || {}).merge update_hash
  end

  def form_data_hash=(hash)
    write_attribute :form_data, hash.to_json
  end

  def form_data_hash
    form_data ? JSON.parse(form_data) : {}
  end

  def sanitize_form_data_hash
    form_data_hash.transform_keys {|key| key.underscore.to_sym}
  end
end
