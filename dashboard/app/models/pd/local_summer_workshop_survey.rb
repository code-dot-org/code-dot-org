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

  belongs_to :pd_enrollment
  validates_presence_of :pd_enrollment
  validates_inclusion_of :day, in: 1..5

  STRONGLY_DISAGREE_TO_STRONGLY_AGREE = [
    'Strongly disagree',
    'Disagree',
    'Slightly disagree',
    'Slightly agree',
    'Agree',
    'Strongly agree'
  ].freeze

  REQUIRED_FIELDS_BY_DAY = [
    [
      :personal_learning_needs_met,
      :clear_understanding_of_plan,
      :provide_explanation_of_framework,
      :feel_more_prepared,
      :activities_as_learner_helped,
      :understand_elements_of_plan,
    ],
    [
    ],
    [
    ],
    [
    ],
    [
    ],
  ].freeze

  def required_fields
    REQUIRED_FIELDS_BY_DAY[day - 1]
  end

  def self.options
    {
      personal_learning_needs_met: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      clear_understanding_of_plan: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      provide_explanation_of_framework: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      feel_more_prepared: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      activities_as_learner_helped: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      understand_elements_of_plan: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
    }.freeze
  end
end
