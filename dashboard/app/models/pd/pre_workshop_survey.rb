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

class Pd::PreWorkshopSurvey < ActiveRecord::Base
  include Pd::Form

  belongs_to :pd_enrollment, class_name: 'Pd::Enrollment'
  validates_presence_of :pd_enrollment
  has_one :workshop, through: :pd_enrollment

  # PreWorkshopSurvey has dynamic options based on the workshop
  def dynamic_options
    {
      unit: units,
      lesson: lessons
    }
  end

  def self.required_fields
    [
      :unit,
      :lesson,
      :questions_and_topics
    ].freeze
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
    @units_and_lessons ||= workshop.try :pre_survey_units_and_lessons
  end
end
