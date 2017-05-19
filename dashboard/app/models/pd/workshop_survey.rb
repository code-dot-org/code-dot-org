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

  def validate_options
    hash = sanitize_form_data_hash

    facilitator_names = pd_enrollment.workshop.facilitators.map(&:name)

    if hash[:who_facilitated]
      hash[:who_facilitated].each do |facilitator|
        add_key_error(key) unless facilitator_names.include? facilitator
      end
    end

    super
  end
end
