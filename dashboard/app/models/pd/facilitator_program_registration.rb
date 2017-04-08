# == Schema Information
#
# Table name: pd_facilitator_program_registrations
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  form_data  :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_pd_facilitator_program_registrations_on_user_id  (user_id)
#

require 'state_abbr'

class Pd::FacilitatorProgramRegistration < ActiveRecord::Base
  REQUIRED_FIELDS = [
    :confirm_teachercon_date,
    :confirm_training_date,
    :address_street,
    :address_city,
    :address_state,
    :address_zip,
    :contact_name,
    :contact_relationship,
    :contact_phone,
    :dietary_needs,
    :live_far_away,
    :how_traveling,
    :need_hotel,
    :need_ada,
    :photo_release,
    :liability_waiver,
    :gender,
    :race,
    :age,
    :grades_taught,
    :grades_planning_to_teach,
    :subjects_taught,
    :cs_years_taught,
  ]

  OTHER = 'Other'.freeze
  FOOD_ALLERGY = 'Food Allergy'.freeze

  OPTIONS = {
    confirm_teachercon_date: [
      'Yes',
      'No - but I need to attend a different date.',
      'No - I\'m no longer interested'
    ],

    alternate_teachercon_date: [
      'TeacherCon 1: June 18 - 23',
      'TeacherCon 2: July 16 - 21',
      'TeacherCon 3: July 30 - August 4'
    ],

    confirm_training_date: [
      'Yes',
      'No'
    ],

    decline_training_date: [
      'I want to participate in the program, but I\'m no longer able to attend these dates.',
      'I am no longer interested in the Code.org Facilitator Development Program.'
    ],

    csd_alternate_training_date: [
      'July 22 - 23 (immediately following TeacherCon 2)',
      'August 5 - 6 (immediately following TeacherCon 3)'
    ],

    csp_alternate_training_date: [
      'June 22-23 (immediately following TeacherCon 1)',
      'July 22 - 23 (immediately following TeacherCon 2)',
      'August 5 - 6 (immediately following TeacherCon 3)'
    ],

    address_state: STATE_ABBR_WITH_DC_HASH.stringify_keys,

    dietary_needs: [
      'None',
      'Vegetarian',
      'Gluten Free',
      FOOD_ALLERGY,
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

    photo_release: [
      'Yes',
    ],

    liability_waiver: [
      'Yes',
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

  def add_key_error(key)
    key = key.to_s.camelize(:lower)
    errors.add(:form_data, :invalid, message: key)
  end

  validate :validate_required_fields
  def validate_required_fields
    hash = form_data_hash.transform_keys {|key| key.underscore.to_sym}

    if hash.try(:[], :confirm_teachercon_date) == 'No - but I need to attend a different date.'
      add_key_error(:alternate_teachercon_date) unless hash.key?(:alternate_teachercon_date)
    end

    if hash.try(:[], :confirm_training_date) == 'No'
      add_key_error(:decline_training_date) unless hash.key?(:decline_training_date)
    end

    if hash.try(:[], :confirm_teachercon_date) == 'No - I\'m no longer interested' || hash.try(:[], :confirm_training_date) == 'No'
      # then we don't really care about the rest of the fields
      return
    end

    REQUIRED_FIELDS.each do |key|
      add_key_error(key) unless hash.key?(key)
    end
  end

  validate :validate_options
  def validate_options
    hash = form_data_hash.transform_keys {|key| key.underscore.to_sym}

    hash_with_options = hash.select do |key, _value|
      OPTIONS.key? key
    end

    hash_with_options.each do |key, value|
      if value.is_a? Array
        value.each do |subvalue|
          add_key_error(key) unless OPTIONS[key].include? subvalue
        end
      else
        add_key_error(key) unless OPTIONS[key].include? value
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
end
