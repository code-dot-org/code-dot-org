# == Schema Information
#
# Table name: pd_pre_workshop_surveys
#
#  id               :integer          not null, primary key
#  pd_enrollment_id :integer          not null
#  form_data        :text(65535)      not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_pd_pre_workshop_surveys_on_pd_enrollment_id  (pd_enrollment_id) UNIQUE
#

class Pd::PreWorkshopSurvey < ApplicationRecord
  include Pd::Form

  UNIT_NOT_STARTED = 'I have not started teaching the course yet'

  belongs_to :pd_enrollment, class_name: 'Pd::Enrollment'
  has_one :workshop, through: :pd_enrollment

  validates_presence_of :pd_enrollment

  # PreWorkshopSurvey has dynamic options based on the workshop
  def dynamic_options
    {
      unit: units,
      lesson: lessons
    }.compact
  end

  def self.required_fields
    [
      :unit
    ].freeze
  end

  # @override
  def dynamic_required_fields(sanitized_form_data_hash)
    # Require lesson also when a unit is selected
    unit_not_started? ? [] : [:lesson]
  end

  def self.units_and_lessons(workshop)
    workshop.pre_survey_units_and_lessons.unshift([UNIT_NOT_STARTED, nil])
  end

  def unit
    sanitize_form_data_hash[:unit]
  end

  def unit_not_started?
    unit == UNIT_NOT_STARTED
  end

  def lesson
    sanitize_form_data_hash[:lesson]
  end

  def unit_lesson_short_name
    return nil if unit_not_started?

    # Attempt to extract the number from "Unit {n}: unit name"
    unit_number = unit.match(/Unit (\d+)/).try(:[], 1)

    # Attempt to extract the number from "Lesson {n}: lesson name"
    lesson_number = lesson&.match(/^Lesson (\d+):/).try(:[], 1)

    if unit_number
      # Lesson should be required when a unit is selected, but we had a bug
      # and some older data has unit but no lesson. In these cases, default to lesson 1
      "U#{unit_number} L#{lesson_number || 1}"
    else
      # Unable to parse the numbers? Use the long names instead:
      "#{unit}, #{lesson}"
    end
  end

  private

  def units
    units_and_lessons.map(&:first)
  end

  def lessons
    selected_unit = units_and_lessons.find {|u| u.first == sanitize_form_data_hash[:unit]}
    selected_unit.try(:last)
  end

  def units_and_lessons
    @units_and_lessons ||= Pd::PreWorkshopSurvey.units_and_lessons(workshop)
  end
end
